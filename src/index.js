// src/index.js

export default {
  async fetch(request, env, ctx) {
    // Lista cu domeniile care au voie să comunice cu acest Worker
    const allowedOrigins = [
      'https://dashboard.phonoa.com',
      'https://blob.phonoa.com',
      'https://x.clipo.live',
      'https://clipo.live'  
    ];

    const origin = request.headers.get('Origin');
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // =================================================================
    // RUTA PENTRU APLICAȚIA NOUĂ (blob.phonoa.com)
    // =================================================================
    if (url.pathname === '/get-api-key') {
      if (!env.GCS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Secretul GCS_API_KEY nu este configurat.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ apiKey: env.GCS_API_KEY }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // =================================================================
    // RUTA PENTRU APLICAȚIA VECHE (dashboard.phonoa.com) - PROXY
    // =================================================================
    
    // Pentru orice altă cale, acționează ca un proxy
    try {
      const newRequest = new Request(request);
      newRequest.headers.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
      newRequest.headers.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);

      const proxyUrl = new URL(request.url);
      proxyUrl.hostname = 'dashboard.phonoa.com'; 
      proxyUrl.protocol = 'https:';

      const response = await fetch(proxyUrl.toString(), newRequest);
      const newResponse = new Response(response.body, response);
      
      Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
      });

      return newResponse;

    } catch (error) {
      console.error('Error proxying request:', error);
      return new Response(`Internal Server Error`, { status: 500 });
    }
  },
};
