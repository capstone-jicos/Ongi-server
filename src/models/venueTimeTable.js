/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('venueTimeTable', {
      eventId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'events',
          key: 'idx'
        }
      },
      venueId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'venue',
          key: 'idx'
        }
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'venueTimeTable',
      timestamps: false,
      freezeTableName: true
    });
  };
  