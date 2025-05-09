// const data=require("../data/dataarray");
//const db=require("../data/db");
const Anc=require("../models/game");
const Game = require("../models/game");
const Users = require("../models/users");
const Friendship = require("../models/friendship");
const FriendRequest = require("../models/friendrequest");
const { Op } = require("sequelize");

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
    const searchQuery = req.query.search || ""; // Arama sorgusu
    const currentPage = parseInt(req.query.page) || 1; // Mevcut sayfa
    const itemsPerPage = 5; // Sayfa başına gösterilecek oyun sayısı

    try {
        // Oyunları filtrele ve sayfalama uygula
        const { count, rows } = await Game.findAndCountAll({
            where: {
                title: { [Op.like]: `%${searchQuery}%` }, // Arama sorgusuna göre filtreleme
            },
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });

        const totalPages = Math.ceil(count / itemsPerPage);

        res.render("user/index", {
            title: "Oyunlar",
            contentTitle: "Tüm Oyunlar",
            games: rows,
            searchQuery,
            currentPage,
            totalPages,
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

exports.getProfileById = async (req, res, next) => {
    const userId = req.session.userid; // Oturum açmış kullanıcının ID'si
    const profileId = req.params.id; // Profilini görüntülemek istediğimiz kullanıcının ID'si

    try {
        // Kullanıcıyı DB'den al
        const user = await Users.findByPk(profileId);
        if (!user) {
            return res.status(404).send("Kullanıcı bulunamadı.");
        }

        // Arkadaşlık durumunu kontrol et
        const isFriend = await Friendship.findOne({
            where: {
                userId: userId,
                friendId: profileId,
            },
        });

        // Gönderilmiş bir arkadaşlık isteği var mı kontrol et
        const hasPendingRequest = await FriendRequest.findOne({
            where: {
                senderId: userId,
                receiverId: profileId,
                status: "pending",
            },
        });

        // Oturum açmış kullanıcıya gelen bir arkadaşlık isteği var mı kontrol et
        const hasIncomingRequest = await FriendRequest.findOne({
            where: {
                senderId: profileId,
                receiverId: userId,
                status: "pending",
            },
        });

        // Kullanıcının arkadaşlarını al
        const friends = await Friendship.findAll({
            where: { userId: profileId },
            include: [
                {
                    model: Users,
                    as: "friend", // Arkadaş bilgilerini al
                    attributes: ["id", "name", "surname"],
                },
            ],
        });

        // Kullanıcının admin olup olmadığını kontrol et
        const isAdmin = req.session.usercategoryId === 1; // Admin kategorisi ID'si 1

        res.render("user/profile", {
            title: "Profil",
            contentTitle: "Kullanıcı Profili",
            user: user,
            isFriend: !!isFriend, // Arkadaşsa true, değilse false
            hasPendingRequest: !!hasPendingRequest, // Gönderilmiş istek varsa true
            hasIncomingRequest: !!hasIncomingRequest, // Gelen istek varsa true
            friends: friends.map(f => f.friend), // Arkadaş listesini gönder
            isAdmin: isAdmin, // Kullanıcının admin olup olmadığını gönder
        });
    } catch (err) {
        next(err);
    }
};
