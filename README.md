# info-cloudflare-zero-trust


The most important thing to add Zero Trust Cloudflare to an external domain is .ENV:

" CF_ACCESS_CLIENT_ID" and " CF_ACCESS_CLIENT_SECRET"

If you have an HTML app on that domain. You need to run a Worker in cloudflare and attach the external html domain. (much simpler if the HTML domain is in cloudflare attached. You don't need to add anything to the html app and you just need to run the worker with " CF_ACCESS_CLIENT_ID" and " CF_ACCESS_CLIENT_SECRET")


info setting worker to cloudflare to this REPO GITHUB: worker-app-zero-trust





