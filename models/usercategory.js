const {DataTypes}=require("sequelize"); 
const db=require("../data/db");

const userCategory=db.define("usercategory",{ //db'de table tanımla
    // categoryid:{ //İsterseniz silebilirsiniz. otomatik oluşturulur. id şeklinde
    //     type: DataTypes.INTEGER,
    //     autoIncrement: true,
    //     allowNull: false,
    //     primaryKey: true,
    // },
    categoryname:{type:DataTypes.STRING(100)}
},
{timestamps:true});

module.exports=userCategory;