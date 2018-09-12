import * as React from 'react';
import {shallow} from 'enzyme';
import {Switch, SwitchProps, Route} from 'react-router';
import {Home} from 'sections';
import {NotFound} from 'components';
import Routes from '../Routes';

jest.mock('react-router', () => ({
  ...require.requireActual('react-router'),
  Switch: function Switch({children}: SwitchProps) {
    return children;
  },
  Route: function Route() {
    return null;
  },
}));

describe('<Routes />', () => {
  it('renders one <Switch />', () => {
    const routes = shallow(<Routes />);
    expect(routes.find(Switch)).toExist();
  });

  it('renders root <Route /> with <Home /> as component', () => {
    const routes = shallow(<Routes />);

    const rootRoute = routes.find(Route).filter({path: '/'});
    expect(rootRoute).toHaveProp('exact', true);
    expect(rootRoute).toHaveProp('component', Home);
  });

  it('renders the last <Route /> with <NotFound /> as component', () => {
    const routes = shallow(<Routes />);

    const lastRoute = routes.find(Route).last();
    expect(lastRoute).not.toHaveProp('path');
    expect(lastRoute).toHaveProp('component', NotFound);
  });
});
