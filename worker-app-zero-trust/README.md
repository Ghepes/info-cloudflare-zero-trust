# Secure proxy .ENV

This is a Cloudflare Worker with Secure proxy .ENV

This is an example project made to be used as a quick start into building .ENV 
secure proxy.


## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm install`
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the .ENV secure proxy to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.js`.

   * The 'fetch' handler is the main entry point of the Worker.
   * Processes incoming HTTP requests to the HTML webapp.

   *   {Request} request HTTP Worker request.
   *   {Object} env The object containing the environment variables (including secrets).
   *   {ExecutionContext} ctx The execution context of the request.

   * These are taken from the secrets you added with `wrangler secret put`.
   * Make sure you define them as CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET.
   * newRequest.headers.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
   * newRequest.headers.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);


## Development

1. Run `wrangler dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.


## Worker deploy

### command is used to link a Cloudflare account with the Wrangler CLI
wrangler connect --account 
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the .ENV secure proxy to Cloudflare Workers
wrangler deploy .


add manual secret value to the worker cloudflare

CF_ACCESS_CLIENT_ID=CF-Access-Client-Id: 229e9a3fbebf15f65e974e343b8c203d.access 

CF_ACCESS_CLIENT_SECRET=CF-Access-Client-Secret: f29dbed84c02e8b173498b0996ad71ee466eb83535fe27b0ff8bbfe437e8c494






