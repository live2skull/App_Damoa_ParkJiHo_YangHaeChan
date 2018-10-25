module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    // 데이터 구분 PK
    id: { field: 'id', type: DataTypes.BIGINT, primaryKey:true, autoIncrement: true },
    
    sn: { field: 'sn', type: DataTypes.CHAR(20), allowNull: false, unique: true }, // 군번
    realname: { field: 'realname', type: DataTypes.CHAR(20), allowNull: false }, // 실명
    phone: { type: DataTypes.CHAR(15), allowNull: false}, // 전화번호
    password_hash: { field: 'password_hash', type: DataTypes.CHAR(128), allowNull: false }, // 비밀번호 - SHA512로 저장!
    
    // hybrid ON-DEMAND INFO!
    
    coord_x: { field: 'coord_x', type: DataTypes.DECIMAL(9, 6), allowNull: true },
    coord_y: { field: 'coord_y', type: DataTypes.DECIMAL(9, 6), allowNull: true },
    room_id: { field: 'room_id', type: DataTypes.CHAR(20), allowNull: true }
    // coord_updated: updatedAt 사용하면 끝!
    
  }, {
      underscored: true,
      freezeTableName: true,
      tableName: 'user'
  });
  
  User.associate = function (models) {
    models.User.hasMany(models.Chat, {foreignKey: 'user_sn', sourceKey: 'sn'});    
  }


  return User;
};

