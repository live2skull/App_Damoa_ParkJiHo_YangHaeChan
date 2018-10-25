module.exports = function (sequelize, DataTypes) {
  const Chat = sequelize.define('Chat', {
    // 데이터 구분 PK
    id: { field: 'id', type: DataTypes.BIGINT, primaryKey:true, autoIncrement: true },
    
    sn: { field: 'sn', type: DataTypes.CHAR(30), allowNull: false}, // 채팅 작성자의 군번
    room_id: { field: 'room_id', type: DataTypes.CHAR(30), allowNull: false }, // 채팅방 고유이름
    message: { field: 'message', type: DataTypes.CHAR(200)} // 채팅데이터
    
  }, {
      underscored: true,
      freezeTableName: true,
      tableName: 'chat'
  });
  
  return Chat;
};

