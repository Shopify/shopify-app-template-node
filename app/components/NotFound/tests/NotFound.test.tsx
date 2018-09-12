import * as React from 'react';
import {shallow} from 'enzyme';
import {Page, PageProps, EmptyState, EmptyStateProps} from '@shopify/polaris';
import NotFound from '../NotFound';

jest.mock('@shopify/polaris', () => ({
  ...require.requireActual('@shopify/polaris'),
  Page: function Page({children}: PageProps) {
    return children;
  },
  EmptyState: function EmptyState({children}: EmptyStateProps) {
    return children;
  },
}));

describe('<NotFound />', () => {
  it('renders one <Page />', () => {
    const notFound = shallow(<NotFound />);
    expect(notFound.find(Page)).toExist();
  });

  it('renders one <EmptyState />', () => {
    const notFound = shallow(<NotFound />);
    expect(notFound.find(EmptyState)).toExist();
  });
});
