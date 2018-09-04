import React from 'react';
import moment from 'moment';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

import * as model from '../../components/model';
import { putJSON } from '../../crud';
import Download from './Download';
import Upload from './Upload';


/**
 * Display the assignment and all submissions, as well as a form to
 * edit the assignment paramters. Requires the assignment model
 * instance in props.
 */
export default class extends React.Component {

  static propTypes = {
    assignment: model.assignmentType.isRequired
  };

  state = {
    orig: this.props.assignment,
    inst: this.props.assignment,
    error: false
  };
    
  isModified = () => this.state.orig !== this.state.inst;

  // Collect the diff between this.state.{orig,inst}
  diff = () => {
    if (this.isModified()) {
      const { orig, inst } = this.state;
      var d = {};
      for (var k of Object.keys(inst))
        if (!orig.hasOwnProperty(k) || inst[k] !== orig[k])
          d = Object.assign(d, { [k]: inst[k] });
      return d;
    } else {
      return false;
    }
  }

  // POST an update of the diff between inst and orig
  update = e => {
    e.preventDefault();
    if (this.isModified()) {
      this.setState({ error: false });
      const d = this.diff();
      if (d) putJSON(`/api/assignment/${this.state.orig.id}`, d)
        .then(succ => this.setState({ orig: this.state.inst }))
        .catch(err => this.setState({ error: err.message }));
    }
  };

  updateName = e => this.setState({
    inst: { ...this.state.inst, name: e.target.value }
  });

  updateDueDate = d => {
    this.setState({ inst: {
      ...this.state.inst, due: d.format()
    }});
  }

  toggleVisible = e => {
    e.preventDefault();
    this.setState({
      inst: { ...this.state.inst, visible: !this.state.inst.visible }
    });
  };

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderSubmissions = () => {
    const { submissions } = this.state.inst;
    if (!submissions || submissions.length === 0) {
      return <p>There are no submissions to this assignment.</p>;
    } else {
      const renderSub = s => (
        <tr key={s.id}>
          <td><model.UserDesc user={s.user}/></td>
          <td>{moment(s.submitted).format('MMMM Do YYYY h:mm a')}</td>
          <td>
            <Download assignment={this.state.inst}
                      submission={s}/>
          </td>
        </tr>
      );
      return (
        <table align="center">
          <tbody>
            <tr>
              <th>User</th>
              <th>Submitted</th>
              <th>Download</th>
            </tr>
            {submissions.map(renderSub)}
          </tbody>
        </table>
      );
    }
  };

  renderDueDate = () => {
    const dueDate = moment(this.state.inst.due);
    return (
      <label>
        Due: <Datetime value={dueDate}
                       dateFormat="MMMM Do YYYY"
                       timeFormat="h:mm a"
                       onChange={this.updateDueDate}/>
      </label>
    );
  };

  renderVisible = () => {
    const { visible } = this.state.inst;
    return (
      <div>
        This assignment is {visible ? '' : 'not '}visible.
        {' '}
        <button onClick={this.toggleVisible}>
          Make {visible ? 'Inv' : 'V'}isible
        </button>
      </div>
    );
  };

  renderUpdate = () => {
    const btn = this.isModified()
      && <input type="submit" value="Update Assignment"/>;
    return  (
      <form onSubmit={this.update}>
        {btn}
        <div>
          <label>
            Assignment Name:
            <input type="text"
                   value={this.state.inst.name} 
                   onChange={this.updateName}/>
          </label>
        </div>
        <this.renderDueDate/>
        <this.renderVisible/>
      </form>
    );
  };

  render = () => {
    const assignment = this.state.inst;
    if (!assignment) return false;
    return (
      <div>
        <h2><model.AssignmentDesc assignment={assignment}/></h2>
        <this.renderError/>
        <this.renderUpdate/>
        <Upload assignment={assignment}/>
        <this.renderSubmissions/>
      </div>
    );
  };

}
