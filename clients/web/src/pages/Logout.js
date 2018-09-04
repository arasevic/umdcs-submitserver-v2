import React from 'react';
import { Redirect } from 'react-router-dom';
import { withAuth } from '../components/Auth';


/**
 * Log out using the authentication context.
 */
class Logout extends React.Component {
  state = {
    redirect: false,
    error: false
  };

  logout = async (event) => {
    event.preventDefault();
    return this.props.auth.logout()
      .then(succ => this.setState({ redirect: succ }))
      .catch(err => this.setState({ 
        redirect: false,
        error: err.message
      }));
  };

  render = () => 
    this.state.redirect 
    ? <Redirect to={'/'}/>
    : this.state.error
    ? <p style={{color:'red'}}>{this.state.error}</p>
    : <button onClick={this.logout}>Logout</button>;
}

export default withAuth(Logout);
