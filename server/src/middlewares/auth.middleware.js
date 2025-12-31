const Admin = require("../models/admin.model");
const User = require("../models/user.model");

const adminAuthMiddleware = async (req, res, next) => {
    try {
        if(!req.session || !req.session.admin) {
            return res.status(400).json({ success : false, message : "Session Not Found !" });
        }

        const admin = Admin.findById(req.session.admin.id);
        if(!admin) {
            return res.status(400).json({ success : false, message : "Something went wrong. Login Again" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(500).json({ success : false, err : error });
    }
}


const userAuthMiddleware = async (req, res, next) => {
    try {
        if(!req.session || !req.session.user) {
            return res.status(400).json({ success : false, message : "Session Not Found !" });
        }

        const user = await User.findById(req.session.user.id);
        if(!user) {
            return res.status(400).json({ success : false, message : "Something went wrong. Login Again" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ success : false, err : error });
    }
}

module.exports = {
    adminAuthMiddleware,
    userAuthMiddleware
}