'use strict';
module.exports = (sequelize, DataTypes) => {
  const submission = sequelize.define('submission', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    submitted: DataTypes.DATE,
    input: DataTypes.BLOB,
    output: DataTypes.STRING
  }, {});
  submission.associate = function(models) {
    submission.belongsTo(models.user);
  };
  return submission;
};
