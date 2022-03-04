import {Shopify} from '@shopify/shopify-api';
import express from 'express';
import request from 'supertest';
import {describe, expect, test, vi} from 'vitest';
import {serve} from '../../__tests__/serve';

import verifyRequest from '../verify-request.js';

describe('verify-request middleware', async () => {
  const {app} = await serve(process.cwd(), false);

  test('should return a function', () => {
    expect(verifyRequest({})).toBeInstanceOf(Function);
  });

  test('requires named parameters object to be passed in', () => {
    expect(() => verifyRequest()).toThrow();
  });

  describe('with a Session & returnHeader enabled', async () => {
    const mockApp = express();
    mockApp.use(
      verifyRequest({
        isOnline: app.get('use-online-tokens'),
        returnHeader: true,
      }),
    );
    mockApp.get('/', (_req, res) => {
      res.status(200).end();
    });

    test('active & valid session does not redirect to /auth', async () => {
      const session = new Shopify.Session.Session(
        '1',
        'test-shop',
        'state',
        app.get('use-online-tokens'),
      );
      session.scope = Shopify.Context.SCOPES;
      session.accessToken = 'access-token';
      session.expires = null;
      vi.spyOn(Shopify.Utils, 'loadCurrentSession').mockImplementationOnce(
        () => session,
      );
      vi.spyOn(Shopify.Clients, 'Graphql').mockImplementationOnce(() => ({
        query: () => ({
          shop: {
            name: 'test-shop',
          },
        }),
      }));

      const response = await request(mockApp).get('/?shop=test-shop').send({
        query: '{shop{name}}',
      });

      expect(response.status).toBe(200);
    });

    test('inactive session with returnHeader returns 403 with the right headers', async () => {
      const session = new Shopify.Session.Session(
        '1',
        'test-shop',
        'state',
        app.get('use-online-tokens'),
      );
      vi.spyOn(Shopify.Utils, 'loadCurrentSession').mockImplementationOnce(
        () => session,
      );

      const response = await request(mockApp).get('/?shop=test-shop').send({
        query: '{shop{name}}',
      });

      expect(response.status).toBe(403);
    });

    test('throws a useful error when: returnHeader && IS_EMBEDDED_APP && !shop && !session && !authHeader.match(/Bearer /)', async () => {
      Shopify.Context.IS_EMBEDDED_APP = true;

      const response = await request(mockApp).get('/');

      expect(response.status).toBe(400);
      expect(response.text).toContain('authenticatedFetch');
    });
  });

  test('inactive session without returnHeader redirects to /auth', async () => {
    const mockApp = express();
    mockApp.use(
      verifyRequest({
        isOnline: app.get('use-online-tokens'),
        returnHeader: false,
      }),
    );
    mockApp.get('/', (_req, res) => {
      res.status(200).end();
    });
    const session = new Shopify.Session.Session(
      '1',
      'test-shop',
      'state',
      app.get('use-online-tokens'),
    );
    vi.spyOn(Shopify.Utils, 'loadCurrentSession').mockImplementationOnce(
      () => session,
    );

    const response = await request(mockApp).get('/?shop=test-shop').send({
      query: '{shop{name}}',
    });

    expect(response.status).toBe(302);
  });

  test('redirects when the session and shop are mismatched', async () => {
    const session = new Shopify.Session.Session(
      '2',
      'test-shop2',
      'state',
      app.get('use-online-tokens'),
    );
    const mockApp = express();
    mockApp.use(verifyRequest({isOnline: app.get('use-online-tokens')}));
    mockApp.get('/', (_req, res) => {
      res.status(200).end();
    });

    const response = await request(mockApp).get('/?shop=test-shop').send({
      query: '{shop{name}}',
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toEqual(`/auth?shop=test-shop`);
  });
});
