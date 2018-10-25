module.exports = function (sequelize, DataTypes) {
  const Unit = sequelize.define('Unit', {
      // 데이터 구분 PK
      id: { field: 'id', primaryKey: true, type: DataTypes.BIGINT, autoIncrement: true, allowNull:false },
      
      name: { field: 'place_name', type: DataTypes.CHAR(200), allowNull: false }, // 부대 통상명칭
      address: { field: 'address_name', type: DataTypes.CHAR(200), allowNull: true }, // 대략적인 부대주소 (강원도 화천)
      mark_url: { field: 'mark_url', type: DataTypes.CHAR(200), allowNull: true }, // 부대 마크(사진) 경로
      room_id: { field: 'room_id', type: DataTypes.CHAR(30), allowNull: false, unique: true } // 채팅방 고유이름


  }, {
    underscored: true,
      freezeTableName: true,
      timestamps: false,
      tableName: 'unit',
      name : { singular: "unit", plural: "unit" }
  });



  return Unit;
};

