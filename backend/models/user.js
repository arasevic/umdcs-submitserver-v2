'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    role: DataTypes.STRING
  }, {});
  user.associate = function(models) {
    user.belongsToMany(models.course, { through: models.permission });
  };
  return user;
};
