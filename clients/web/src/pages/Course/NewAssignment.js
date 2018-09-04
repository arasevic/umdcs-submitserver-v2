import React from 'react';
import ty from 'prop-types';
import moment from 'moment';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

import { postJSON } from '../../crud';


/**
 * Display a form to create a new assignment. (Used internally by the
 * class NewAssignment.)
 */
class NewAssignmentPrompt extends React.Component {

  static propTypes = {
    courseId: ty.number.isRequired
  }

  state = {
    name: '',
    due: moment().format(),
    visible: false,
    error: false,
    complete: false
  };

  updateName = e => this.setState({ name: e.target.value });
  updateDueDate = d => this.setState({ due: d.format() });
  updateVisible = e => this.setState({ visible: e.target.checked });

  handleSubmit = async e => {
    e.preventDefault();
    const { name, due, visible } = this.state;
    const { courseId } = this.props;
    this.setState({ error: false, complete: false });
    postJSON(`/api/assignment`, { name, due, visible, courseId })
      .then(succ => this.setState({ complete: true }))
      .catch(err => this.setState({ error: err.message }));
  };

  canCreateAssignment = () => {
    const { name } = this.state;
    return name.length > 0;
  };

  renderForm = () => {
    const btn = this.state.name.length > 0
      && <button type="submit">Create Assignment</button>;
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label>
            Assignment Name:
            <input type="text"
                   value={this.state.name} 
                   onChange={this.updateName}/>
          </label>
        </div>
        <div>
          <label>
            Due: <Datetime value={moment(this.state.due)}
                           dateFormat="MMMM Do YYYY"
                           timeFormat="h:mm a"
                           onChange={this.updateDueDate}/>
          </label>
        </div>
        <div>
          <label>
            Visible:
            <input type="checkbox"
                   value={this.state.visible}
                   onChange={this.updateVisible}/>
          </label>
        </div>
        {btn}
      </form>
    );
  }

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  render = () => this.state.complete
    ? <NewAssignment courseId={this.props.courseId} success={true}/>
    : (
      <div>
        <this.renderError/>
        <this.renderForm/>
      </div>
    );

}


/**
 * Displays a button that allows the user to create a new
 * assignment. When pressed, displays a form to enter name, due date,
 * and visibiliy. Must be given the `courseId' as a numeric prop.
 */
class NewAssignment extends React.Component {

  static propTypes = {
    courseId: ty.number.isRequired,
    success: ty.bool
  };

  state = {
    pressed: false
  };

  press = e => {
    e.preventDefault();
    this.setState({ pressed: true });
  };

  renderSuccess = () => this.props.success
    ? <p>Assignment created!</p>
    : false;

  render = () => this.state.pressed
    ? <NewAssignmentPrompt courseId={this.props.courseId}/>
    : (
      <div>
        <this.renderSuccess/>
        <form onSubmit={this.press}>
          <button type="submit">New Assignment</button>
        </form>
      </div>
    );

}

export default NewAssignment;
