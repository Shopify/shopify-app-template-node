import * as React from 'react';
import {mount} from 'enzyme';
import {createWithAppMountOptions} from 'tests/utilities';

import {AppProvider} from '@shopify/polaris';
import Routes from '../../Routes';
import App from '../App';

jest.mock('@shopify/polaris', () => ({
  ...require.requireActual('@shopify/polaris'),
  AppProvider: function AppProvider({children}: any) {
    return children;
  },
}));

jest.mock('../../Routes', () => ({
  default() {
    return null;
  },
}));

describe('<App />', () => {
  it('renders one <AppProvider />', () => {
    const app = mount(<App />, createWithAppMountOptions());
    expect(app.find(AppProvider)).toExist();
  });

  it('renders <Routes />', () => {
    const app = mount(<App />, createWithAppMountOptions());
    expect(app.find(Routes)).toExist();
  });
});
