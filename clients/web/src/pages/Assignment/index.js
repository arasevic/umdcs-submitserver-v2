import React from 'react';
import ty from 'prop-types';

import { withAuth, authType, Roles } from '../../components/Auth';
import { getJSON } from '../../crud';
import StudentView from './StudentView';
import EditView from './EditView';


/**
 * Show the submissions of a assignment
 */
class Assignment extends React.Component {
  static propTypes = {
    match: ty.shape({
      params: ty.shape({
        id: ty.string.isRequired,
        aid: ty.string.isRequired
      })
    }),
    auth: authType
  };

  state = {
    assignment: false,
    error: false
  };

  fetchState = () =>
    getJSON(`/api/assignment/${this.props.match.params.aid}`)
      .then(doc => this.setState({ assignment: doc }))
      .catch(err => this.setState({ error: err.message }))

  componentDidMount = () => this.fetchState()

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderAssignment = () => {
    const { assignment } = this.state;
    if (!assignment) return false;
    const { auth, match: { params: { id } } } = this.props;
    return auth.authorized(Roles.ta, id)
      ? <EditView assignment={assignment}/>
      : <StudentView assignment={assignment}/>;
  }
  
  render = () => (
    <div>
      <this.renderError/>
      <this.renderAssignment/>
    </div>
  );
}

export default withAuth(Assignment);
