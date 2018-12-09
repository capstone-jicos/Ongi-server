/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attendees', {
    eventId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'events',
        key: 'idx'
      }
    },
    attendeeId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    attending: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    merchant_uid: {
      type: DataTypes.INTEGER(11)
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'attendees'
  });
};
