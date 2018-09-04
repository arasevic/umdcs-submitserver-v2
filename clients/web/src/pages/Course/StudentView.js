import React from 'react';
import moment from 'moment';

import * as model from '../../components/model';


/**
 * Display course assignments.
 */
export default class extends React.Component {

  static propTypes = {
    course: model.courseType
  };

  renderAssignment = (a) => {
    return (
      <tr key={a.id}>
        <td><model.AssignmentLink assignment={a}/></td>
        <td>{moment(a.due).format('MMMM Do YYYY h:mm a')}</td>
      </tr>
    );
  }

  renderAssignments = () => (
    <table align="center">
      <tbody>
        <tr>
          <th>Name</th>
          <th>Due</th>
        </tr>
        {this.props.course.assignments.map(this.renderAssignment)}
      </tbody>
    </table>
  );

  render = () => this.props.course && (
    <div>
      <h2><model.CourseDesc course={this.props.course}/></h2>
      <this.renderAssignments/>
    </div>
  );

}
