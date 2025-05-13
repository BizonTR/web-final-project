// const data=require("../data/dataarray");
//const db=require("../data/db");
const Anc=require("../models/game");
const Game = require("../models/game");
const Users = require("../models/users");
const Friendship = require("../models/friendship");
const FriendRequest = require("../models/friendrequest");
const { Op } = require("sequelize");
const GameImages = require("../models/gameimages");
const slugField = require("../helpers/slugfield");

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
    const gameId = req.params.id;

    try {
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).send("Oyun bulunamadı.");
        }

        const slug = slugField(game.title);
        if (req.params.slug !== slug) {
            return res.redirect(`/game/${gameId}/${slug}`);
        }

        // Oyunla ilişkili resimleri al
        const gameImages = await GameImages.findAll({
            where: { gameId: gameId },
        });

        res.render("user/game-details", {
            title: game.title,
            contentTitle: game.title,
            game: game,
            gameImages: gameImages, // Resim galerisi için veriyi gönder
        });
    } catch (err) {
        next(err);
    }
};

exports.getProfileById = async (req, res, next) => {
    const userId = req.params.id;
    const currentUserId = req.session.userid;

    try {
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).send("Kullanıcı bulunamadı.");
        }

        const slug = slugField(`${user.name} ${user.surname}`);
        if (req.params.slug !== slug) {
            return res.redirect(`/user/profile/${userId}/${slug}`);
        }

        // Kullanıcının arkadaşlarını al
        const friends = await Friendship.findAll({
            where: { userId: userId },
            include: [
                {
                    model: Users,
                    as: "friend",
                    attributes: ["id", "name", "surname"],
                },
            ],
        });

        // Oturum açmış kullanıcının arkadaş olup olmadığını kontrol et
        const isFriend = await Friendship.findOne({
            where: {
                userId: currentUserId,
                friendId: userId,
            },
        });

        // Oturum açmış kullanıcıdan gelen bir arkadaşlık isteği var mı kontrol et
        const hasPendingRequest = await FriendRequest.findOne({
            where: {
                senderId: currentUserId,
                receiverId: userId,
            },
        });

        // Oturum açmış kullanıcıya gelen bir arkadaşlık isteği var mı kontrol et
        const hasIncomingRequest = await FriendRequest.findOne({
            where: {
                senderId: userId,
                receiverId: currentUserId,
            },
        });

        res.render("user/profile", {
            title: "Profil",
            contentTitle: "Kullanıcı Profili",
            user: user,
            friends: friends.map(f => f.friend), // Sadece arkadaş bilgilerini gönder
            isFriend: !!isFriend, // Boolean olarak gönder
            hasPendingRequest: !!hasPendingRequest, // Boolean olarak gönder
            hasIncomingRequest: !!hasIncomingRequest, // Boolean olarak gönder
        });
    } catch (err) {
        next(err);
    }
};
