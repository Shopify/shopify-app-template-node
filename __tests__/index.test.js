import {describe, expect, test} from 'vitest';
import request from 'supertest';

import {serve} from './serve.js';

describe('vitest', async () => {
  const {app} = await serve(process.cwd(), false);

  test('works!', () => {
    request(app).get('/').expect(200);
  });
});
