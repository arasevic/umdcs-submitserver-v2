import React from 'react';
import ty from 'prop-types';

import { withAuth, authType, Roles } from '../components/Auth';
import * as model from '../components/model';
import { getJSON } from '../crud';

/**
 * Show the assignments of a course
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

  componentDidMount = async () => {
    if (!this.state.course) await this.fetchState();
  };

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderAssignment = (a) => {
    const isTAorGreater = 
      this.props.auth.authorized(Roles.ta, this.props.match.params.id);
    return (a.visible || isTAorGreater) && (
      <tr key={a._id}>
        <td><model.AssignmentLink assignment={a}/></td>
        <td>{a.due}</td>
        {isTAorGreater && <td>{a.visible ? 'Yes' : 'No'}</td>}
      </tr>
    );
  }

  renderAssignments = () => (
    <table>
      <tbody>
        <tr>
          <th>Name</th>
          <th>Due</th>
          {this.props.auth.authorized(Roles.ta, this.props.match.params.id)
           && <th>Visible</th>}
        </tr>
        {this.state.course.assignments.map(this.renderAssignment)}
      </tbody>
    </table>
  );

  renderCourse = () => this.state.course && (
    <div>
      <h2><model.CourseDesc course={this.state.course}/></h2>
      <this.renderAssignments/>
    </div>
  );
  
  render = () => (
    <div>
      <this.renderError/>
      <this.renderCourse/>
    </div>
  );
}

export default withAuth(Course);
