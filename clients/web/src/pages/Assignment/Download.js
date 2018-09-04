import React from 'react';
import fileDownload from 'react-file-download';

import * as model from '../../components/model';

/**
 * Download a submitted file from the server. Requires the relevant
 * submission and assignment model instances as props.
 */
class Download extends React.Component {

  static propTypes = {
    assignment: model.assignmentType.isRequired,
    submission: model.submissionType.isRequired
  };

  onClick = async () => {
    const {
      assignment: { id: aid, courseId },
      submission: { id: sid, userId, submitted }
    } = this.props;
    try {
      const res = await fetch(`/api/submit/${courseId}/${aid}/${sid}`);
      switch (res.status) {
      case 200:
        const blob = await res.blob();
        const ms = new Date(submitted).getTime();
        const path = `${courseId}-${aid}-${userId}-${ms}.zip`;
        fileDownload(blob, path);
        break;
      default:
        console.log('Unexpected response code:', res.status);
        break;
      }
    } catch (err) {
      console.log('Error occurred during download:', err);
    }
  };

  render = () => <button onClick={this.onClick}>Download</button>;

}

export default Download;
