/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comments', {
    idx: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'events',
        key: 'idx'
      }
    },
    parentId: {
      type: DataTypes.STRING(64),
      allowNull: true,
      references: {
        model: 'comments',
        key: 'idx'
      }
    },
    writerId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'comments'
  });
};
