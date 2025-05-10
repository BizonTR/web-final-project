const onlineUsers = new Map(); // Store userId -> lastActivity timestamp

// Initialize global online users Map with userId -> lastActivity timestamp
if (!global.onlineUsersMap) {
    global.onlineUsersMap = new Map();
}

module.exports = (req, res, next) => {
    // For authenticated users, update their last activity time
    if (req.session && req.session.isAuth && req.session.userid) {
        // Update the user's last activity time
        global.onlineUsersMap.set(req.session.userid, Date.now());
    }
    
    // Clean up users who haven't been active for more than 5 minutes
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    global.onlineUsersMap.forEach((lastActivity, userId) => {
        if (now - lastActivity > fiveMinutes) {
            global.onlineUsersMap.delete(userId);
        }
    });
    
    // Convert Map keys (userIds) to array for use in templates
    global.onlineUsers = Array.from(global.onlineUsersMap.keys());
    
    next();
};