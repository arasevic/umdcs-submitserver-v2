import React from 'react';
import { Redirect } from 'react-router-dom';
import { withAuth, authType } from '../components/Auth';

/**
 * Tell user to log in, or redirect to courses if already logged in
 */
class Home extends React.Component {
  static propTypes = {
    auth: authType
  };
  
  render = () => this.props.auth.authenticated()
    ? <Redirect to='/courses'/>
    : <p>Log in to see your courses!</p>;
}

export default withAuth(Home);
