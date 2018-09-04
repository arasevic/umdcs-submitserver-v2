'use strict';
module.exports = (sequelize, DataTypes) => {
  const course = sequelize.define('course', {
    name: DataTypes.STRING,
    number: DataTypes.STRING
  }, {});
  course.associate = function(models) {
    course.belongsToMany(models.user, { through: models.permission });
    course.hasMany(models.assignment);
  };
  return course;
};
