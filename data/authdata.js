const bcrypt = require('bcrypt');

//asenkron hash yapmak için aşağıdaki gibi yazılabilir.
// const defineData=async()=>{const authdata=[
//     {email:"aaa",
//      password:await bcrypt.hash("bbb",10)
//     }
// ]
// return authdata
// }


// module.exports=defineData();


const authdata=[
        {email:"a@b.com",
         password:bcrypt.hashSync("123",10),
         name:"Umay"
        },
        {email:"b@c.com",
         password:bcrypt.hashSync("456",10),
         name:"Ahmet"
        }
    ]

    module.exports=authdata;