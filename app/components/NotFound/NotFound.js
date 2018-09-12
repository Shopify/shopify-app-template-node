import * as React from 'react';
import {Page, EmptyState} from '@shopify/polaris';

import emptyStateIllustration from './illustrations/404.svg';

export default function NotFound() {
  return (
    <Page title="">
      <EmptyState
        heading="The page you’re looking for couldn’t be found"
        image={emptyStateIllustration}
        action={{content: 'Go back to Home', url: '/'}}
      >
        <p>Please make sure the web address is correct.</p>
      </EmptyState>
    </Page>
  );
}
