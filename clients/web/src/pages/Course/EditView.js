import React from 'react';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css';

import * as model from '../../components/model';
import NewAssignment from './NewAssignment';


/**
 * Display course assignments and allow the user to create new
 * assignments.
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
        <td>{a.visible ? 'V' : 'Inv'}isible</td>
      </tr>
    );
  }

  renderAssignments = () => (
    <table align="center">
      <tbody>
        <tr>
          <th>Assignment</th>
          <th>Due</th>
          <th>Visible</th>
        </tr>
        {this.props.course.assignments.map(this.renderAssignment)}
      </tbody>
    </table>
  );

  render = () => this.props.course && (
    <div>
      <h2><model.CourseDesc course={this.props.course}/></h2>
      <this.renderAssignments/>
      <NewAssignment courseId={this.props.course.id}/>
    </div>
  );

}
