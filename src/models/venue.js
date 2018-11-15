/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('venue', {
    idx: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uniqueId: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    accomodate: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    lng: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    amenities: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    rules: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    fee: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'venue'
  });
};
