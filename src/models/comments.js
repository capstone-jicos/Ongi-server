/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comments', {
    idx: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'events',
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
    timestamps: false,
    freezeTableName: true,
    tableName: 'comments'
  });
};
