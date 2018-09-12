import * as React from 'react';
import {Switch, Route} from 'react-router';
import {Home} from 'sections';
import {NotFound} from 'components';

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}
