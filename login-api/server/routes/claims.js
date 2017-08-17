var express = require('express');
var router = express.Router();
//load user mongoose model
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SECRET = "sampleapplication";
var Claim = require('../models/claim');

var async = require('async');
var officegen = require('officegen');

var fs = require('fs');
var path = require('path');

router.use(function(req, res, next) {
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, SECRET, function(err, decoded) {
            if (err) {
                res.json({ success: false, message: "Session has expired, please login and try again" });
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.redirect('/');
    }
});

router.get("/individual/:claimid", function(req, res) {
    if (req.params.claimid) {
        Claim.findOne({ claimno: req.params.claimid }, function(err, claim) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Oops! You are trying something that is not supported"
                });
            } else {
                if (req.decoded.username === claim.username || req.decoded.role === "super") {
                    var access = "R"
                    claimData = claim;
                    if (req.decoded && req.decoded.role === "super") {
                        access = "W";
                    }
                    res.json({
                        success: true,
                        claim: claimData,
                        access: access
                    });
                } else {
                    return res.json({
                        success: false,
                        message: "Oops! You are trying something that is not supported"
                    });
                }
            }
        });
    } else {
        return res.json({
            success: false,
            message: "Oops! It seems the claim id is wrong."
        })
    }
})

router.get('/claimList', function(req, res, next) {

    if (req.decoded && req.decoded.role === "single") {
        Claim.find({ username: req.decoded.username }, " -_id username claimno claimdate claimoffice claimname claimamount contactnum dischargedate dischargeamount remarks", function(err, claims) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Oops! You are trying something that is not supported"
                });
            } else {
                return res.json({
                    success: true,
                    claims: claims
                });
            }
        });

    } else if (req.decoded && req.decoded.role === "super") {
        Claim.find({}, "-_id username claimno claimdate claimoffice claimname claimamount contactnum dischargedate dischargeamount remarks", function(err, claims) {
            if (err) {
                return res.json({
                    success: false,
                    message: "Oops! You are trying something that is not supported"
                });
            } else {
                return res.json({
                    success: true,
                    claims: claims
                });
            }
        })
    }

});

router.post('/updateClaim/:claimId', function(req, res) {
    console.log(req.params.claimId);
    console.log(req.body.dischargeamount);
    Claim.findOne({ claimno: req.params.claimId }, function(err, claim) {
        if (err) {
            return res.json({
                success: false,
                message: "No such claim exist"
            });
        } else {
            console.log(claim);
            if (claim.username === req.decoded.username || req.decoded.role === "super") {
                claim.dischargedate = req.body.dischargedate;
                claim.dischargeamount = req.body.dischargeamount;
                claim.claimno = "8";
                claim.save(function(err) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: "Server failure. Please contact the administrator"
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "Claim details are updated"
                        });
                    }
                })
            } else {
                return res.json({
                    success: false,
                    message: "Access denied"
                });
            }
        }
    });

});

//add claim
router.post('/addClaim', function(req, res) {
    if (req.decoded && req.decoded.role === "super") {
        var employeeno = req.body.employeeno,
            claimno = req.body.claimno,
            claimname = req.body.claimname,
            claimdate = req.body.claimdate,
            claimoffice = req.body.claimoffice,
            claimamount = req.body.claimamount,
            contactnum = req.body.contactnum;

        if (employeeno == null || employeeno == '' || claimno == null || claimno == '' || claimdate == null || claimdate == '' ||
            claimoffice == null || claimoffice == '' || claimamount == null || claimamount == '' || contactnum == null ||
            contactnum == '' || claimname == null || claimname == '') {
            return res.json({ success: false, message: "Ensure required fields were provided" })
        }
        User.findOne({
            employeenumber: employeeno
        }, 'username', function(userErr, claimUser) {
            if (userErr) {
                return res.json({
                    success: false,
                    message: "Oops! You are trying something that is not supported"
                });
            } else {
                var newClaims = new Claim();
                newClaims.claimname = claimname;
                newClaims.claimno = claimno;
                newClaims.claimdate = claimdate;
                newClaims.claimoffice = claimoffice;
                newClaims.claimamount = claimamount;
                newClaims.contactnum = contactnum;
                newClaims.username = claimUser.username;
                newClaims.save(function(saveErr) {
                    if (saveErr) {
                        return res.json({
                            success: false,
                            message: "Claim already exists"
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "Claim is created"
                        });
                    }
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

router.post('/print', function(req, res) {
    var docx = officegen({
        type: 'docx',
        orientation: 'landscape'

    });
    docx.on('error', function(err) {
        return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
    });

    var header = docx.getHeader().createP();

    header.addText("Nepal Telecom", {
        align: "Center",
        font_size: 15,
        font_face: 'Times New Roman',
        bold: true
    });

    header.addHorizontalLine();
    var table = [
        [{
            val: "Claim Number",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT",
            }
        }, {
            val: "Claimer",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Claim Name",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Claimed Date",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Claim office",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Claimed Amount",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Contact",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Discharge date",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Discharge amount",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }, {
            val: "Remarks",
            opts: {
                b: true,
                fontFamily: "FONTASY_ HIMALI_ TT"
            }
        }]
    ]
    var datum = req.body;
    if (datum) {
        for (var i = 0, j = 1, length = datum.length; i < length; i++, j++) {
            var row = datum[i];
            var rowArray = [
                row.claimno,
                row.username,
                row.claimname,
                row.claimdate,
                row.claimoffice,
                row.claimamount,
                row.contactnum,
                row.dischargedate ? row.dischargedate : '',
                row.dischargeamount ? row.dischargeamount : '',
                row.remarks ? row.remarks : ''
            ];
            table[j] = rowArray;
        }
    }

    var tableStyle = {
        tableAlign: "left",
        tableFontFamily: "Calibri",
        borders: true,
        tableColWidth: 3000,
    }

    var pObj = docx.createTable(table, tableStyle);
    var out = fs.createWriteStream('public/downloads/out.docx', { flags: 'w' });

    out.on('error', function(err) {
        return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
    });

    async.parallel([
        function(done) {
            out.on('close', function() {
                console.log('Finish to create a DOCX file.');
                res.json({ success: true, url: "downloads/out.docx" });
            });
            docx.generate(out);
        }

    ], function(err) {
        if (err) {
            return res.json({ success: false, message: "File can not be downloaded, please contact the administrator" });
        } // Endif.
    });
});


module.exports = router;