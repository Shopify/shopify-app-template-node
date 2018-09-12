import * as React from 'react';
import {resolve} from 'path';
import {readJSONSync} from 'fs-extra';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import HTML, {DOCTYPE} from '@shopify/react-html';

import {vendorBundleUrl} from '../config/server';
import App from '../app';
import config from '../config/app';

const assetsPath = resolve(__dirname, '../build/client/assets.json');

export default function renderApp(ctx) {
  const {js, css} = readJSONSync(assetsPath).entrypoints.main;
  const scripts =
    // eslint-disable-next-line no-process-env
    process.env.NODE_ENV === 'development'
      ? [{path: vendorBundleUrl}, ...js.map((entry) => {
        return {
          path: entry.path.replace('http://localhost:8080', ''),
        };
      })]
      : js;

  const context = {};

  const data = {
    apiKey: config.apiKey,
    shopOrigin: ctx.request.query.shop ? ctx.request.query.shop : ctx.session.shop,
  };

  try {
    ctx.status = 200;
    ctx.body =
      DOCTYPE +
      renderToString(
        // eslint-disable-next-line react/jsx-pascal-case
        <HTML scripts={scripts} styles={css} data={data}>
          <StaticRouter location={ctx.request.url} context={context}>
            <App />
          </StaticRouter>
        </HTML>,
      );
  } catch (error) {
    throw error;
  }
}
