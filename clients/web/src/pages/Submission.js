import React from 'react';
import ty from 'prop-types';
import moment from 'moment';

import { withAuth, authType } from '../components/Auth';
import * as model from '../components/model';
import { getJSON } from '../crud';

/**
 * Show the details of a submission
 */
class Submission extends React.Component {
  static propTypes = {
    match: ty.shape({
      params: ty.shape({
        id: ty.string.isRequired
      })
    }),
    auth: authType
  };

  state = {
    submission: false,
    error: false
  };

  fetchState = () =>
    getJSON(`/api/submission/${this.props.match.params.id}`)
      .then(doc => this.setState({ submission: doc }))
      .catch(err => this.setState({ error: err.message }))

  componentDidMount = async () => {
    if (!this.state.submission) await this.fetchState();
  };

  renderError = () =>
    this.state.error &&
      <p style={{color: 'red'}}>Error: { this.state.error }</p>;

  renderSubmission = () => this.state.submission && (
    <div>
      <h2>
        <model.SubmissionDesc submission={this.state.submission}/>
        {' at '}
        {moment(this.state.submission.date).format('LLLL')}
      </h2>
      <label>
        {'Input: '}
        <p>{this.state.submission.input}</p>
      </label>
      <label>
        {'Output: '}
        <p>{this.state.submission.output}</p>
      </label>
    </div>
  );
  
  render = () => (
    <div>
      <this.renderError/>
      <this.renderSubmission/>
    </div>
  );
}

export default withAuth(Submission);
