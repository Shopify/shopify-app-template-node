import {describe, expect, test} from 'vitest';
import request from 'supertest';

import {serve} from './serve.js';

describe('vitest', async () => {
  const {app} = await serve(process.cwd(), false);

  test('works!', () => {
    request(app).get('/').expect(200);
  });

  test.todo('make sure we go to oauth');
  test.todo('when we go to oauth we get the toplevel');
  test.todo('get proper redirection url to start oauth');
  test.todo('handle the callback correctly');
  test.todo('webhook processing');
  test.todo('graphql proxy');
  test.todo('a div with the app renders');
});
