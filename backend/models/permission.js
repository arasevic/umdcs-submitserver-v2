'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define('permission', {
    userId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    role: DataTypes.STRING
  }, {});
  return permission;
};
