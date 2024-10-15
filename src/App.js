import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import AdminRoutes from './features/admin/AdminRoutes';
import QuizRoutes from './features/quiz/QuizRoutes';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/admin" component={AdminRoutes} />
        <Route path="/quiz" component={QuizRoutes} />
      </Switch>
    </Router>
  );
}

export default App;
