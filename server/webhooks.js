import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const {SHOPIFY_API_SECRET_KEY} = process.env;

export default function validateWebhook(ctx, next) {
  console.log('Webhook: New product in the store');
  const hmac_header = ctx.get('X-Shopify-Hmac-Sha256');
  const body = ctx.request.rawBody;
  const generated_hash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET_KEY)
    .update(body, 'utf8', 'hex')
    .digest('base64');
  if (generated_hash === hmac_header) {
    console.log('Success, webhook came from Shopify');
    ctx.res.statusCode = 200;
    return;
  } else {
    console.log('Fail, webhook not from Shopify');
    ctx.res.statusCode = 403;
    return;
  }
}
