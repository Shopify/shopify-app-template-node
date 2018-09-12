import * as React from 'react';
import {mount} from 'enzyme';
import {createWithAppMountOptions} from 'tests/utilities';

import {Page} from '@shopify/polaris';
import HomeDetails from '../HomeDetails';

jest.mock('@shopify/polaris', () => ({
  ...require.requireActual('@shopify/polaris'),
  Page: function Page() {
    return null;
  },
}));

describe('<HomeDetails />', () => {
  describe('<Page />', () => {
    it('renders', () => {
      const homeDetails = mount(<HomeDetails />, createWithAppMountOptions());
      expect(homeDetails.find(Page)).toExist();
    });

    it('renders app title', () => {
      const homeDetails = mount(<HomeDetails />, createWithAppMountOptions());
      expect(homeDetails.find(Page)).toHaveProp('title', 'your-app-name');
    });
  });
});
