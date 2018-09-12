import * as React from 'react';
import {mount} from 'enzyme';
import {Link as ReactRouterLink} from 'react-router-dom';

import Link from '../Link';

jest.mock('react-router-dom', () => ({
  ...require.requireActual('react-router-dom'),
  Link: function Link() {
    return null;
  },
}));

describe('<Link />', () => {
  describe('url', () => {
    it('renders a react router link', () => {
      const link = mount(<Link url="/home" />);
      expect(link.find(ReactRouterLink)).toExist();
    });

    it('sets the to prop and passes along all others', () => {
      const url = '/home';
      const props = {className: 'foo'};
      const link = mount(<Link url={url} {...props} />);
      expect(link.find(ReactRouterLink).props()).toMatchObject({
        ...props,
        to: url,
      });
    });

    it('does not set external attributes', () => {
      const link = mount(<Link url="/home" />);
      expect(link.find(ReactRouterLink).prop('target')).toBeUndefined();
      expect(link.find(ReactRouterLink).prop('rel')).toBeUndefined();
    });
  });

  describe('external', () => {
    it('renders a react router link', () => {
      const link = mount(<Link url="https://shopify.com" />);
      expect(link.find(ReactRouterLink)).toExist();
    });

    it('sets the to prop and passes along all others', () => {
      const url = '/home';
      const props = {className: 'foo'};
      const link = mount(<Link url={url} {...props} />);
      expect(link.find(ReactRouterLink).props()).toMatchObject({
        ...props,
        to: url,
      });
    });

    it('sets default external attributes', () => {
      const link = mount(<Link url="https://shopify.com" external />);
      expect(link.find(ReactRouterLink).props()).toMatchObject({
        target: '_blank',
        rel: 'noopener noreferrer',
      });
    });
  });
});
