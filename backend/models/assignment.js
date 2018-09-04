'use strict';
module.exports = (sequelize, DataTypes) => {
  const assignment = sequelize.define('assignment', {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: DataTypes.STRING,
    due: DataTypes.TIME,
    visible: DataTypes.BOOLEAN
  }, {});
  assignment.associate = function(models) {
    assignment.hasMany(models.submission);
  };
  return assignment;
};
