import React from 'react';

import * as model from '../../components/model';

/**
 * Upload a file to be saved as a submission. Requires the assignment
 * model instance in props.
 */
export default class Upload extends React.Component {

  static propTypes = {
    assignment: model.assignmentType.isRequired
  }

  state = {
    file: null,
    success: false,
    error: false
  };

  updateFile = e => this.setState({ file: e.target.files[0] });

  uploadFile = e => {
    e.preventDefault();
    this.setState({ success: false, error: false });
    const { assignment: { id, courseId } } = this.props;
    const { file } = this.state;
    const body = new FormData();
    body.append('file', file);
    console.log('file', file);
    fetch(`/api/submit/${courseId}/${id}`, {
      method: 'POST', credentials: 'same-origin', body
    }).then(res => {
      switch (res.status) {
      case 201:
        this.setState({ 
          success: `Successfully submitted ${file.name}!`,
          file: null
        });
        break;
      default:
        this.setState({ error: `Unexpected response code: ${res.status}` });
        break;
      }
    }).catch(err => this.setState({ error: err.message }));
  };

  renderUpload = () => (
    <label>
      Upload File
      <form onSubmit={this.uploadFile}>
        <input type="file" onChange={this.updateFile}/>
        <button type="submit">Upload</button>
      </form>
    </label>
  );

  renderSuccess = () => this.state.success && <p>{this.state.success}</p>;

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  render = () => this.props.assignment && (
    <div>
      <this.renderSuccess/>
      <this.renderError/>
      <this.renderUpload/>
    </div>
  );

}
