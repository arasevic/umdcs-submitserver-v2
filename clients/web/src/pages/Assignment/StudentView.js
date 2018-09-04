import React from 'react';
import moment from 'moment';

import * as model from '../../components/model';
import Download from './Download';
import Upload from './Upload';


/**
 * Display the assignment and student submissions. Requires the
 * assignment model instance in props.
 */
export default class extends React.Component {

  static propTypes = {
    assignment: model.assignmentType.isRequired
  };

  renderSubmissions = () => {
    const { submissions } = this.props.assignment;
    if (!submissions || submissions.length === 0) {
      return <p>You have not yet submitted to this assignment.</p>;
    } else {
      const renderSub = s => {
        return (
          <tr key={s.id}>
            <td>{moment(s.submitted).format('MMMM Do YYYY h:mm a')}</td>
            <td>
              <Download assignment={this.props.assignment}
                        submission={s}/>
            </td>
          </tr>
        );
      };
      return (
        <table align="center">
          <tbody>
            <tr>
              <th>Submitted</th>
              <th>Download</th>
            </tr>
            {submissions.map(renderSub)}
          </tbody>
        </table>
      );
    }
  };

  render = () => {
    const { assignment } = this.props;
    if (!assignment) return false;
    const dueDate = moment(assignment.due).format('MMMM Do YYYY h:mm a');
    return (
      <div>
        <h2><model.AssignmentDesc assignment={assignment}/></h2>
        <label>{'Due: '} {dueDate}</label>
        <this.renderSubmissions/>
        <Upload assignment={assignment}/>
      </div>
    );
  };

}
