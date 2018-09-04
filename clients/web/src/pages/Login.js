import React from 'react';
import { Redirect } from 'react-router-dom';

import { withAuth, authType } from '../components/Auth';


/**
 * Log in using the authentication context.
 * 
 * NOTE: Only uses `username' to log in; the password is ignored.
 */
class Login extends React.Component {

  static propTypes = {
    auth: authType
  };

  state = {
    username: '',
    password: '',
    error: false,
    success: false
  };

  updateUsername = (event) => {
    this.setState({ username: event.target.value });
  };

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
  };

  handleLogin = async (event) => {
    try {
      event.preventDefault();
      this.setState({ error: false });
      const { username } = this.state;
      const success = await this.props.auth.login(username);
      this.setState({ success });
    } catch (err) {
      switch (err.message) {
      case '401':
        this.setState({ error: `Incorrect user or password` });
        break;
      default:
        this.setState({ error: `Unexpected response: ${err}` });
        break;
      }
    }
  };

  renderForm = () => (
    <div>
      <form onSubmit={this.handleLogin}>
        <div>
          <label>
            Username:
            <input type="text"
                   value={this.state.username}
                   onChange={this.updateUsername}
                   />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type="password"
                   value={this.state.password}
                   onChange={this.updatePassword}
                   />
          </label>
        </div>
        <input type="submit" value="Submit"/>
      </form>
      {this.state.error && <p>{this.state.error}</p>}
    </div>
  );

  renderSuccess = () => {
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    return <Redirect to={from}/>;
  }

  render = () => 
    this.state.success
    ? this.renderSuccess()
    : this.renderForm();
  
}

export default withAuth(Login);
