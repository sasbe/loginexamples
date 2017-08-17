var express = require('express');
var router = express.Router();
//load user mongoose model
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";
var excludePath = ['/users/authenticate'];

router.use(function(req, res, next) {
    console.log(req.originalUrl);
    console.log(excludePath.indexOf(req.originalUrl));
    if (excludePath.indexOf(req.originalUrl) != -1) {
        next();
    } else {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: "Invalid token" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.redirect('/');
        }
    }
});
router.post('/authenticate', function(req, res) {
    console.log(req.body.username);
    User.findOne({
        username: req.body.username
    }, 'username emailid password employeenumber role', function(err, user) {
        if (err) {
            return res.json({ success: false, message: err });
        } else {
            if (!user) {
                return res.json({ success: false, message: "User does not exist" });
            } else {
                var isValidPassword = user.comparePassword(req.body.password || "");
                if (!isValidPassword) {
                    return res.json({ success: false, message: "Could not authenticate password" });
                } else {
                    console.log(true);
                    var token = jwt.sign({
                        username: user.username,
                        emailid: user.emailid,
                        employeenumber: user.employeenumber,
                        role: user.role
                    }, SECRET, { expiresIn: '1h' });
                    return res.json({ success: true, message: "User authenticate", token: token });
                }
            }
        }

    });
});

router.post('/createUser', function(req, res) {
    if (req.decoded && req.decode.role === "super") {
        var username = req.body.username,
            password = req.body.password,
            emailid = req.body.emailid,
            employeenumber = req.body.employeeno,
            designation = req.body.designation,
            level = req.body.level,
            woffice = req.body.level;

        if (username == null || username == '' || emailid == null || emailid == '' || password == null || password == '' ||
            employeenumber == null || employeenumber == '' || designation == null || designation == '' || level == null || level == '' ||
            woffice == null || woffice == '') {
            console.log("false");
            return res.json({ success: false, message: "Ensure username, emaild and password were provided" })
        }
        var newUser = new User();
        newUser.username = username;
        newUser.password = password;
        newUser.emailid = emailid;
        newUser.designation = designation;
        newUser.employeenumber = employeenumber;
        newUser.level = level;
        newUser.woffice = woffice;
        newUser.role = "single";
        newUser.save(function(err) {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "User already exists"
                });
            } else {
                return res.json({
                    success: true,
                    message: "User is created"
                });
            }
        });
    } else {
        return res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });
    }
});

//give the user profile
router.post('/me', function(req, res) {
    console.log(req.decoded);
    res.send({
        success: true,
        userDetails: req.decoded
    });
});
module.exports = router;