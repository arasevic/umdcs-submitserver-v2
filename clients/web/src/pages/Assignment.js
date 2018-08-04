import React from 'react';
import ty from 'prop-types';
import moment from 'moment';

import { withAuth, authType, Roles } from '../components/Auth';
import * as model from '../components/model';
import { getJSON } from '../crud';

/**
 * Show the submissions of a assignment
 */
class Assignment extends React.Component {
  static propTypes = {
    match: ty.shape({
      params: ty.shape({
        id: ty.string.isRequired
      })
    }),
    auth: authType
  };

  state = {
    assignment: false,
    error: false
  };

  fetchState = () =>
    getJSON(`/api/assignment/${this.props.match.params.id}`)
      .then(doc => this.setState({ assignment: doc }))
      .catch(err => this.setState({ error: err.message }))

  componentDidMount = async () => {
    if (!this.state.assignment) await this.fetchState();
  };

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderSubmission = (s) => {
    const isTAorGreater = 
      this.props.auth.authorized(Roles.ta, this.props.match.params.id);
    const userId = this.props.auth.token.id;
    return (userId === s.user._id || isTAorGreater) && (
      <tr key={s._id}>
        <td><model.SubmissionLink submission={s}/></td>
        <td>{moment(s.date).format('LLLL')}</td>
      </tr>
    );
  }

  renderSubmissions = () => (
    <table>
      <tbody>
        <tr>
          <th>User</th>
          <th>Date</th>
        </tr>
        {this.state.assignment.submissions.map(this.renderSubmission)}
      </tbody>
    </table>
  );

  renderAssignment = () => this.state.assignment && (
    <div>
      <h2><model.AssignmentDesc assignment={this.state.assignment}/></h2>
      <label>{'Due: '} {this.state.assignment.due}</label>
      <this.renderSubmissions/>
    </div>
  );
  
  render = () => (
    <div>
      <this.renderError/>
      <this.renderAssignment/>
    </div>
  );
}

export default withAuth(Assignment);
