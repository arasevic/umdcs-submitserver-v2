import React from 'react';
import ty from 'prop-types';

import { withAuth, authType, Roles } from '../../components/Auth';
import { getJSON } from '../../crud';
import EditView from './EditView';
import StudentView from './StudentView';


/**
 * Show the assignments of a course. Requires a course ID URL
 * parameter and the authentication context.
 */
class Course extends React.Component {
  static propTypes = {
    match: ty.shape({
      params: ty.shape({
        id: ty.string.isRequired
      })
    }),
    auth: authType
  };

  state = {
    course: false,
    error: false
  };

  fetchState = () =>
    getJSON(`/api/course/${this.props.match.params.id}`)
      .then(doc => this.setState({ course: doc }))
      .catch(err => this.setState({ error: err.message }))

  componentDidMount = () => this.fetchState()

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderCourse = () => {
    const { course } = this.state;
    if (!course) return false;
    const { auth, match: { params: { id } } } = this.props;
    return auth.authorized(Roles.ta, id)
      ? <EditView course={course}/>
      : <StudentView course={course}/>;
  }
  
  render = () => (
    <div>
      <this.renderError/>
      <this.renderCourse/>
    </div>
  );
}

export default withAuth(Course);
