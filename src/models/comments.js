'use strict';
module.exports = (sequelize, DataTypes) => {
  const comments = sequelize.define('comments', {
    idx: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    eventId: DataTypes.STRING,
    parentId: {
      type : DataTypes.STRING,
      defaultValue : null
    },
    writerId: DataTypes.STRING,
    comment: DataTypes.TEXT,
    createdAt : DataTypes.DATE,
    updatedAt:DataTypes.DATE
  }, {
    timestamps: false,
    freezeTableName: true
  });
  comments.associate = function(models) {
    // associations can be defined here
  };
  return comments;
};