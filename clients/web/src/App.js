import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import logo from './logo.svg';
import './App.css';

import { Provider as Auth, PrivateRoute } from './components/Auth';
import NavBar from './components/NavBar';

import Home from './pages/Home';
import Login from './pages/Login';
import Logout from './pages/Logout';
import NotFound from './pages/NotFound';
import Courses from './pages/Courses';
import Course from './pages/Course';
import Assignment from './pages/Assignment';

class App extends Component {

  renderRoutes = () => (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/logout" component={Logout} />
      <PrivateRoute exact path="/courses" component={Courses}/>
      <PrivateRoute exact path="/course/:id" component={Course}/>
      <PrivateRoute exact path="/course/:id/:aid" component={Assignment}/>
      <Route component={NotFound} />
    </Switch>
  );

  render() {
    return (
      <div className="App">
        <Auth>
          <BrowserRouter>
            <div>
              <NavBar/>
              <this.renderRoutes/>
            </div>
          </BrowserRouter>
        </Auth>
      </div>
    );
  }
}

export default App;
