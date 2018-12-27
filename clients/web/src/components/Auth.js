import React, { Component } from 'react';
import ty from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const CHECK_PATH  = '/api/check';
const LOGIN_PATH  = '/api/login';
const LOGOUT_PATH = '/api/logout';

const Context = React.createContext();

export const Roles = {
  student: 'student',
  ta: 'ta',
  prof: 'prof',
  admin: 'admin'
};

export const roleAllows = (role, req) => {
  return req === Roles.student
    || (req === Roles.ta && role !== Roles.student)
    || (req === Roles.prof && (role === Roles.admin || role === Roles.prof))
    || role === Roles.admin;
};

export const roleType = ty.oneOf([
  'student',
  'ta',
  'prof',
  'admin'
]);

export const tokenType = ty.oneOfType([
  ty.oneOf([
    null,    // unknown authentication status (before GET at /api/check)
    false    // known to be unauthenticated
  ]),
  ty.shape({ // valid token from server
    id: ty.number,
    name: ty.string,
    courses: ty.arrayOf(ty.shape({
      id: ty.number,
      permission: ty.shape({ role: roleType })
    }))
  })
]);

export const authType = ty.shape({
  token: tokenType,
  check: ty.func.isRequired,
  login: ty.func.isRequired,
  logout: ty.func.isRequired,
  authenticated: ty.func.isRequired,
  unauthenticated: ty.func.isRequired,
  authorized: ty.func.isRequired
});

export class Provider extends Component {

  // TODO: Is it better to render nothing until we know we're
  // authenticated or not? Or better to render an unauthenticated
  // state briefly immediately but rerender if authenticated? Depends
  // on the auth turnaround? What if the server's down? Maybe it
  // should be a technical difficulties page?
  render = () =>
    this.state.token === null
    ? <div/>
    : (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    ) ;

  login = async (username, password) => {
    const res = await fetch(LOGIN_PATH, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    switch (res.status) {
    case 200:
      const token = await res.json();
      this.setState({ token });
      return true;
    case 401: throw new Error('Invalid login');
    default: throw new Error(`Received an unexpected response: ${res.status}`);
    }
  };

  /**
   * Ask the server whether we are authenticated.
   * If so, sets token to the JSON response
   * Otherwise sets token to false
   */
  check = async () => {
    //const res = await fetch(CHECK_PATH, { credentials: 'same-origin' });
    const token = false;//res.status === 200 ? await res.json() : false;
    this.setState({ token });
    return this.authenticated();
  };

  // Log out
  logout = async () => {
    this.setState({ token: false });
    const res = await fetch(LOGOUT_PATH, {
      method: 'POST',
      credentials: 'same-origin'
    });
    switch(res.status) {
    case 200:
      return true;
    default:
      throw new Error(`Unexpected response during logout: ${res.status}`);
    }
  };

  // Check whether the user is known to be authenticated
  authenticated = () => Boolean(this.state.token);

  // Check whether the user is known to be unauthenticated
  unauthenticated = () => this.state.token === false;

  // Check locally to see if we're authorized to view
  // something allowed for the given role and course.
  authorized = (reqRole, course) => {
    if (this.authenticated()) {
      const { courses, role } = this.state.token;
      if (course) {
        const access = courses.filter(c => c.id === parseInt(course, 10));
        return access.length > 0
          && roleAllows(access[0].permission.role, reqRole);
      } else {
        return roleAllows(role, reqRole);
      }
    } else return false;
  };

  state = {
    token: null,
    check: this.check,
    login: this.login,
    logout: this.logout,
    authenticated: this.authenticated,
    unauthenticated: this.unauthenticated,
    authorized: this.authorized
  };

  // Check if we already have our client-side cookie
  componentDidMount = this.check;

}

// Exposes auth property to Comp
export const withAuth = (Comp) => (props) => (
  <Context.Consumer>
    {auth => <Comp {...props} auth={auth} />}
  </Context.Consumer>
);

// Allows only logged in users to access Route.
export const PrivateRoute =
  withAuth(({ component: Component, auth, ...rest }) => (
    <Route {...rest} render={props => {
        return (auth.authenticated()
        ? <Component {...props} />
        : auth.unauthenticated()
        ? <Redirect to={{ pathname: '/login',
                          state: { from: props.location }
                        }} />
        : <div/>
        )}} />
  ));
