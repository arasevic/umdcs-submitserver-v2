import React from 'react';

import { withAuth, authType } from '../components/Auth';
import * as model from '../components/model';
import { getJSON } from '../crud';

/**
 * List the classes to which the user has access
 */
class Courses extends React.Component {
  static propTypes = {
    auth: authType
  };

  state = {
    courses: false,
    error: false
  };

  fetchState = () =>
    getJSON(`/api/user/${this.props.auth.token.id}`)
    .then(doc => this.setState({ courses: doc.courses }))
      .catch(err => this.setState({ error: err.message }))

  componentDidMount = async () => {
    if (!this.state.courses.length) await this.fetchState();
  };

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderCourse = ({ role, course }) =>
    <li key={course._id}><model.CourseLink course={course}/></li>;
  
  render = () => (
    <div>
      <this.renderError/>
      {this.state.courses
        ? <ul>{this.state.courses.map(this.renderCourse)}</ul>
        : <div/>}
    </div>
  );
}

export default withAuth(Courses);
