import {Shopify} from '@shopify/shopify-api';
import {createHmac} from 'crypto';
import request from 'supertest';
import {describe, expect, test, vi} from 'vitest';

import {serve} from './serve.js';

describe('shopify-app-node', async () => {
  const {app} = await serve(process.cwd(), false);

  test('loads html on /', async () => {
    const response = await request(app).get('/').set('Accept', 'text/html');

    expect(response.status).toEqual(200);
  });

  test('goes to top level auth in oauth flow when there is no cookie', async () => {
    const response = await request(app).get('/auth').set('Accept', 'text/html');

    expect(response.status).toEqual(302);
    expect(response.headers.location).toContain(`/auth/toplevel`);
  });

  test('renders toplevel auth page', async () => {
    const response = await request(app)
      .get('/auth/toplevel?shop=test-shop')
      .set('Accept', 'text/html');

    expect(response.status).toEqual(200);
    expect(response.text).toContain(`shopOrigin: 'test-shop'`);
  });

  test('goes through oauth flow if there is a top level cookie', async () => {
    // get a signed top level cookie from the headers
    const {headers} = await request(app).get('/auth/toplevel');

    const response = await request(app)
      .get('/auth')
      .set('Cookie', ...headers['set-cookie']);

    expect(response.status).toEqual(302);
    expect(response.headers.location).toContain(`/admin/oauth/authorize`);
  });

  describe('handles the callback correctly', () => {
    test('redirects to / with the shop and host if nothing goes wrong', async () => {
      const validateAuthCallback = vi
        .spyOn(Shopify.Auth, 'validateAuthCallback')
        .mockImplementationOnce(() => ({
          shop: 'test-shop',
          scope: 'write_products',
        }));
      vi.spyOn(Shopify.Webhooks.Registry, 'register').mockImplementationOnce(
        () => ({
          APP_UNINSTALLED: {
            success: true,
          },
        }),
      );

      const response = await request(app).get(
        '/auth/callback?host=test-shop-host&shop=test-shop',
      );

      expect(validateAuthCallback).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.anything(),
        {
          host: 'test-shop-host',
          shop: 'test-shop',
        },
      );
      expect(app.get('active-shopify-shops')).toEqual({
        'test-shop': 'write_products',
      });
      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual(
        '/?shop=test-shop&host=test-shop-host',
      );
    });

    test('returns 400 if oauth is invalid', async () => {
      vi.spyOn(Shopify.Auth, 'validateAuthCallback').mockImplementationOnce(
        () => {
          throw new Shopify.Errors.InvalidOAuthError('test 400 response');
        },
      );

      const response = await request(app).get(
        '/auth/callback?host=test-shop-host',
      );

      expect(response.status).toEqual(400);
      expect(response.text).toContain('test 400 response');
    });

    test('redirects to auth if cookie is not found', async () => {
      vi.spyOn(Shopify.Auth, 'validateAuthCallback').mockImplementationOnce(
        () => {
          throw new Shopify.Errors.CookieNotFound('cookie not found');
        },
      );

      const response = await request(app).get(
        '/auth/callback?host=test-shop-host&shop=test-shop',
      );

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/auth?shop=test-shop');
    });

    test('redirects to auth if session is not found', async () => {
      vi.spyOn(Shopify.Auth, 'validateAuthCallback').mockImplementationOnce(
        () => {
          throw new Shopify.Errors.SessionNotFound('session not found');
        },
      );

      const response = await request(app).get(
        '/auth/callback?host=test-shop-host&shop=test-shop',
      );

      expect(response.status).toEqual(302);
      expect(response.headers.location).toEqual('/auth?shop=test-shop');
    });

    test('returns a 500 error otherwise', async () => {
      vi.spyOn(Shopify.Auth, 'validateAuthCallback').mockImplementationOnce(
        () => {
          throw new Error('test 500 response');
        },
      );

      const response = await request(app).get(
        '/auth/callback?host=test-shop-host&shop=test-shop',
      );

      expect(response.status).toEqual(500);
      expect(response.text).toContain('test 500 response');
    });
  });

  describe('webhook processing', () => {
    const process = vi.spyOn(Shopify.Webhooks.Registry, 'process');

    test('processes webhooks', async () => {
      Shopify.Webhooks.Registry.addHandler('TEST_HELLO', {
        path: '/webhooks',
        webhookHandler: () => {},
      });

      const response = await request(app)
        .post('/webhooks')
        .set(
          'X-Shopify-Hmac-Sha256',
          createHmac('sha256', Shopify.Context.API_SECRET_KEY)
            .update('{}', 'utf8')
            .digest('base64'),
        )
        .set('X-Shopify-Topic', 'TEST_HELLO')
        .set('X-Shopify-Shop-Domain', 'test-shop')
        .send('{}');

      expect(response.status).toEqual(200);
      expect(process).toHaveBeenCalledTimes(1);
    });

    test('returns a 500 error if webhooks do not process correctly', async () => {
      process.mockImplementationOnce(() => {
        throw new Error('test 500 response');
      });

      const response = await request(app).post('/webhooks');

      expect(response.status).toEqual(500);
      expect(response.text).toContain('test 500 response');
    });
  });

  describe('graphql proxy', () => {
    vi.mock(`${process.cwd()}/server/middleware/verify-request.js`, () => ({
      default: vi.fn(() => (req, res, next) => {
        next();
      }),
    }));
    const proxy = vi.spyOn(Shopify.Utils, 'graphqlProxy');

    test('graphql proxy is called & responds with body', async () => {
      const body = {
        data: {
          test: 'test',
        },
      };
      proxy.mockImplementationOnce(() => ({
        body,
      }));

      const response = await request(app).post('/graphql').send({
        query: '{hello}',
      });

      expect(proxy).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(body);
    });

    test('returns a 500 error if graphql proxy fails', async () => {
      proxy.mockImplementationOnce(() => {
        throw new Error('test 500 response');
      });

      const response = await request(app).post('/graphql');

      expect(response.status).toEqual(500);
      expect(response.text).toContain('test 500 response');
    });
  });

  test.todo('a div with the app renders');
});
