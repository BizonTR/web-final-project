module.exports = (req, res, next) => {
    res.status(404).render("not-found", {
        title: "404 - Not Found",
        contentTitle: "Page Not Found",
        url: req.originalUrl,
    });
};