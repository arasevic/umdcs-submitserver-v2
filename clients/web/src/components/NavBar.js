import React from 'react';
import { Link } from 'react-router-dom';

import { Roles, withAuth } from '../components/Auth';

const NoAuthLinks = () => (
  <React.Fragment>
    <Link to="/login">Login</Link>
  </React.Fragment>
);

const AuthLinks = () => (
  <React.Fragment>
    <Link to="/logout">Logout</Link>
  </React.Fragment>
);

const AdminLinks = () => (
  false
);

const NavBar = withAuth(({ auth }) => {
  return (
    <div>
      <Link to="/">Home</Link>
      {' '}
      { auth.authenticated() ? <AuthLinks/> : <NoAuthLinks/> }
      { auth.authorized(Roles.admin) && <AdminLinks/> }
      { auth.token && <p>Welcome {auth.token.name}!</p> }
    </div>
  );
});

export default NavBar;
