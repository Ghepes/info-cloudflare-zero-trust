// src/index.js

/**
 * secure proxy
 */

export default {
  /**
   * The 'fetch' handler is the main entry point of the Worker.
   * Processes incoming HTTP requests to the HTML webapp.
   *
   * @param {Request} request HTTP Worker request.
   * @param {Object} env The object containing the environment variables (including secrets).
   * @param {ExecutionContext} ctx The execution context of the request.
   */
  async fetch(request, env, ctx) {
    // Clone the original request so you can modify it
    const newRequest = new Request(request);


   // These are taken from the secrets you added with `wrangler secret put`.
   // Make sure you define them as CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET.
    newRequest.headers.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
    newRequest.headers.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);

    // These headers are essential for the browser to interpret your HTML application.
    // to be able to receive responses from this Worker.
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://dashboard.domain.com', // <--- REPLACE WITH THE ACTUAL APPLICATION DOMAIN HTML EXTERN APP
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', // any custom headers sent by the frontend
      'Access-Control-Max-Age': '86400',
    };

    // Respond to OPTIONS requests (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
    // Construct the destination URL of the actual request.
    // The worker will redirect the request to the actual hostname of your service,
    // using the same path as the original request (after removing the /proxy prefix).
      const url = new URL(request.url);

      // Remove '/proxy' from the URL path before sending to the destination.
      // For example, 'https://worker-domain.com/proxy/api/data' becomes '/api/data'.
      url.pathname = url.pathname.replace(/^\/proxy/, '');

      // --- OBLIGATORIU: Seteaza hostname-ul serviciului tau real ---
      // Acesta este serviciul (ex: API-ul tau backend) care necesita token-urile de autentificare.
      url.hostname = 'dashboard.domain.com'; // <--- REPLACE WITH THE ACTUAL APPLICATION DOMAIN HTML EXTERN APP
      url.protocol = 'https:'; // HTTPS

      // Send the modified request (with authentication headers) to the real destination
      const response = await fetch(url.toString(), newRequest);

      // Clone the response from the destination and add CORS headers
      const newResponse = new Response(response.body, response);
      Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
      });

      return newResponse;

    } catch (error) {
      console.error('Error proxying request:', error);
      // Generic error message for the public, for security.
      return new Response(`Internal Server Error: ${error.message || 'Could not process request.'}`, { status: 500 });
    }
  },
};
