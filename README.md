## What
This is a Cloudflare worker function that takes incoming payload and sends to desired discord channel using webhooks.

## How
1. Uses [SMS to URL Forwarder](https://github.com/bogkonstantin/android_income_sms_gateway_webhook) to send the SMS to deployed worker
2. Worker does auth by looking for correct header value for `x-client-secret`
3. Formats incoming data and `POST` it to discord webhook URL (configured as a CF worker secret)


## Development

1. Ensure `node` and `pnpm` or `npm` are present in `$PATH`.
2. Inside project root, do `pnpm i` or `npm i`
3. To run project locally do `pnpm dev` or `npm run dev`
4. Configure a `.dev.vars` file following `.sample.env`


