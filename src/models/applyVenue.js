/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('applyVenue', {
      venueId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'venue',
          key: 'idx'
        }
      },
      eventId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'events',
            key:'idx'
        }
      },
      status: {
        type: DataTypes.INTEGER(1),
        allowNull: false
      },
      hostId: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      providerId: {
          type: DataTypes.STRING(45),
          allowNull: false
      }
    }, {
      timestamps: false,
      freezeTableName: true,
      tableName: 'applyVenue'
    });
  };
  