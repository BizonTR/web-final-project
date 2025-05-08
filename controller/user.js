// const data=require("../data/dataarray");
//const db=require("../data/db");
const Anc=require("../models/game");
const Game = require("../models/game");

exports.userHome=async(req,res,next)=>{ //ana sayfa
    try{
         //const allData=await db.execute("SELECT * FROM anc");
         const allData=await Anc.findAll({raw:true});
        res.render("user/index",{title:"Ana sayfa",contentTitle:"Ana sayfa",data:allData});
    }
    catch(err){
        return next(err);
    }
   
}

exports.viewAnc=async(req,res,next)=>{//duyuru details
    try{
        //const selectedData=await Anc.findByPk(req.params.id);
        const selectedData=await Anc.findAll({
            where: {url:req.params.slug},
            raw:true
        });
        console.log(selectedData)
        const allData=await Anc.findAll({raw:true});
        res.render("user/view-anc",{title:selectedData.title,contentTitle:selectedData.title,viewData:selectedData[0],data:allData});
   }
   catch(err){
       return next(err);
   } 
}

exports.getGames = async (req, res, next) => {
    try {
        const games = await Game.findAll();
        res.render("user/index", { 
            title: "Games", 
            contentTitle: "All Games", 
            games 
        });
    } catch (err) {
        next(err);
    }
};

exports.getGameDetails = async (req, res, next) => {
    const id = req.params.id;
    try {
        const game = await Game.findByPk(id);
        if (!game) {
            return res.status(404).render("admin/error", { 
                title: "Error", 
                contentTitle: "Game Not Found", 
                err: "Game not found" 
            });
        }
        res.render("user/game-details", { 
            title: game.title, 
            contentTitle: game.title, 
            game 
        });
    } catch (err) {
        next(err);
    }
};
