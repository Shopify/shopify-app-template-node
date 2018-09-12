import * as React from 'react';
import {Switch, Route, withRouter, RouteComponentProps} from 'react-router';
import compose from '@shopify/react-compose';

import {NotFound} from 'components';
import HomeDetails from './HomeDetails';

function HomeRoutes({match}) {
  return (
    <Switch>
      <Route exact path={match.url} component={HomeDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

HomeRoutes.propTypes = RouteComponentProps;

export default compose(withRouter)(HomeRoutes);
