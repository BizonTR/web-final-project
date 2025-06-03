// const data=require("../data/dataarray");
//const db=require("../data/db");
const Game = require("../models/game");
const Users = require("../models/users");
const Friendship = require("../models/friendship");
const FriendRequest = require("../models/friendrequest");
const { Op } = require("sequelize");
const GameImages = require("../models/gameimages");
const slugField = require("../helpers/slugfield");

exports.userHome=async(req,res,next)=>{ //ana sayfa
    try{
         //const allData=await db.execute("SELECT * FROM game");
         const allData=await Game.findAll({raw:true});
        res.render("user/index",{title:"Ana sayfa",contentTitle:"Ana sayfa",data:allData});
    }
    catch(err){
        return next(err);
    }
   
}

exports.viewGame=async(req,res,next)=>{//game details
    try{
        //const selectedData=await Game.findByPk(req.params.id);
        const selectedData=await Game.findAll({
            where: {url:req.params.slug},
            raw:true
        });        console.log(selectedData)
        const allData=await Game.findAll({raw:true});
        res.render("user/view-game",{title:selectedData.title,contentTitle:selectedData.title,viewData:selectedData[0],data:allData});
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
    const currentUserId = req.session.userid; // Giriş yapılmamışsa undefined olacak
    const isLoggedIn = !!currentUserId; // Boolean olarak oturum durumu

    try {
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).send("Kullanıcı bulunamadı.");
        }

        const slug = slugField(`${user.name} ${user.surname}`);
        if (req.params.slug !== slug) {
            return res.redirect(`/user/profile/${userId}/${slug}`);
        }

        // Varsayılan değerler - giriş yapmamış kullanıcılar için
        let friends = [];
        let isFriend = false;
        let hasPendingRequest = false;
        let hasIncomingRequest = false;

        // Sadece giriş yapmış kullanıcılar için arkadaşlık verilerini kontrol et
        if (isLoggedIn) {
            // Kullanıcının arkadaşlarını al
            const friendships = await Friendship.findAll({
                where: { userId: userId },
                include: [
                    {
                        model: Users,
                        as: "friend",
                        attributes: ["id", "name", "surname"],
                    },
                ],
            });

            friends = friendships.map(f => f.friend);

            // Oturum açmış kullanıcının arkadaş olup olmadığını kontrol et
            isFriend = !!(await Friendship.findOne({
                where: {
                    userId: currentUserId,
                    friendId: userId,
                },
            }));

            // Oturum açmış kullanıcıdan gelen bir arkadaşlık isteği var mı kontrol et
            hasPendingRequest = !!(await FriendRequest.findOne({
                where: {
                    senderId: currentUserId,
                    receiverId: userId,
                },
            }));

            // Oturum açmış kullanıcıya gelen bir arkadaşlık isteği var mı kontrol et
            hasIncomingRequest = !!(await FriendRequest.findOne({
                where: {
                    senderId: userId,
                    receiverId: currentUserId,
                },
            }));
        }

        res.render("user/profile", {
            title: "Profil",
            contentTitle: "Kullanıcı Profili",
            user: user,
            friends: friends,
            isFriend: isFriend,
            hasPendingRequest: hasPendingRequest,
            hasIncomingRequest: hasIncomingRequest,
            isLoggedIn: isLoggedIn,
            userid: currentUserId || null,
            session: req.session || {},
            slugField: slugField
        });
    } catch (err) {
        next(err);
    }
};
