import React from 'react';
import { Link } from 'react-router-dom';
import ty from 'prop-types';

import { roleType } from './Auth';

function ifElse(children, other) {
  const arr = React.Children.toArray(children);
  return arr.length > 0 ? children : other;
}

// Workaround to define recursive prop-types
function recType(f) {
  return function() { return f().apply(this, arguments); };
}

export var submissionType = ty.shape({
  _id: ty.string,
  user: recType(() => userType),
  date: ty.string,
  input: ty.string,
  output: ty.string
});

export function SubmissionDesc(props) {
  const { user } = props.submission;
  return `${user.name} Submission`;
}
SubmissionDesc.propTypes = {
  submission: submissionType
};

export function SubmissionLink(props) {
  return (
    <Link to={`/submission/${props.submission._id}`}>
      {ifElse(props.children,
              <SubmissionDesc submission={props.submission}/>)}
    </Link>
  );
}
SubmissionLink.propTypes = {
  submission: submissionType
};

export var assignmentType = ty.shape({
  _id: ty.string,
  name: ty.string,
  due: ty.string,
  visible: ty.bool,
  submissions: ty.arrayOf(ty.oneOfType([ ty.string, submissionType ]))
});

export function AssignmentDesc(props) {
  return props.assignment.name;
}
AssignmentDesc.propTypes = {
  assignment: assignmentType
};

export function AssignmentLink(props) {
  return (
    <Link to={`/assignment/${props.assignment._id}`}>
      {ifElse(props.children,
              <AssignmentDesc assignment={props.assignment}/>)}
    </Link>
  );
}
AssignmentLink.propTypes = {
  assignment: assignmentType
};

export var courseType = ty.shape({
  _id: ty.string,
  name: ty.string,
  number: ty.string,
  assignments: ty.arrayOf(ty.oneOfType([ ty.string, assignmentType ]))
});

export function CourseDesc(props) {
  var { name, number } = props.course;
  return `${name} (${number})`;
}
CourseDesc.propTypes = {
  course: courseType
};

export function CourseLink(props) {
  return (
    <Link to={`/course/${props.course._id}`}>
      {ifElse(props.children, <CourseDesc course={props.course}/>)}
    </Link>
  );
}
CourseLink.propTypes = {
  course: courseType
};

export var userType = ty.shape({
  _id: ty.string,
  name: ty.string,
  username: ty.string,
  role: roleType,
  courses: ty.arrayOf(ty.shape({
    role: roleType,
    course: ty.oneOfType([ ty.string, courseType ])
  }))
});

export function UserDesc(props) {
  const { name, username } = props.user;
  return name ? username : 'Unknown User';
}
UserDesc.propTypes = {
  user: userType
};

export function UserLink(props) {
  return (
    <Link to={`/user/${props.user._id}`}>
      {ifElse(props.children, <UserDesc user={props.user}/>)}
    </Link>
  );
}
UserLink.propTypes = {
  user: userType
};

