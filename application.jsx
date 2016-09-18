import React from 'react'
import { render } from 'react-dom'
import { IndexRoute, Router, Route, browserHistory } from 'react-router'

import EntityHistory from './src/components/entityHistory.jsx';
import EntitiesList from './src/components/entitiesList.jsx';
import Lockdown from './src/components/lockdown.jsx';

render((
  <Router history={browserHistory}>
    <Route path="/">
        <IndexRoute component={Lockdown} />
        <Route path="/entity/:entityId/history" component={EntityHistory}/>
        <Route path="/entities" component={EntitiesList}/>
    </Route>
  </Router>
), document.getElementById('root'))