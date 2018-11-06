/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('events', {
    idx: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hostId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    venueId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'venue',
        key: 'idx'
      }
    },
    feeAmount: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    eventImages: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'events'
  });
};
