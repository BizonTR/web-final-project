const {DataTypes}=require("sequelize"); 
const db=require("../data/db");
const Users=db.define("users",{ //db'de table tanımla
    // userid:{ //İsterseniz silebilirsiniz. otomatik oluşturulur. id şeklinde
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     allowNull: false,
    //     primaryKey: true,
    // },
    name:{type: DataTypes.STRING(100)},
    surname: {type: DataTypes.STRING(100)},
    email: {type: DataTypes.STRING(50)},
    password: {type: DataTypes.STRING(200)}

}, //tabloya createdAt ve updatedAt olmak üzere 2 otomatik field ekler.
//Bu alnaların otomatik eklenmesini istemiyorsanız aşağıdaki özelliği eklemelisiniz.
{timestamps:true});

module.exports = Users;