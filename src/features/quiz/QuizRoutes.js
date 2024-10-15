import React from 'react';
import { Route, Switch } from 'react-router-dom';
import QuizList from './components/QuizList';
import QuizItem from './components/QuizItem';

function QuizRoutes() {
  return (
    <Switch>
      <Route exact path="/quiz" component={QuizList} />
      <Route path="/quiz/:id" component={QuizItem} />
    </Switch>
  );
}

export default QuizRoutes;

