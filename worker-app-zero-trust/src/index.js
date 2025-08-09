// src/index.js

export default {
  async fetch(request, env, ctx) {
    // List of domains that are allowed to communicate with this Worker
    const allowedOrigins = [
      'https://dashboard.phonoa.com',
      'https://blob.phonoa.com' 
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
    // ROUTE FOR THE NEW APPLICATION (blob.phonoa.com)
    // =================================================================
    if (url.pathname === '/get-api-key') {
      if (!env.GCS_API_KEY) {
        return new Response(JSON.stringify({ error: 'The GCS_API_KEY secret is not configured.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ apiKey: env.GCS_API_KEY }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // =================================================================
    // ROUTE FOR THE OLD APPLICATION (dashboard.phonoa.com)
    // =================================================================
    
    // For any other path, it acts as a proxy
    try {
      const newRequest = new Request(request);
      newRequest.headers.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
      newRequest.headers.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);

      const proxyUrl = new URL(request.url);
      // We assume that the proxy is used for all paths that are not /get-api-key
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
// =================================================================