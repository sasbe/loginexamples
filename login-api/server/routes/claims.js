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
    try {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, function(err, decoded) {
                if (err) {
                    res.redirect('/');
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.json({ success: false, message: err });
    }
});

router.get("/individual/:claimid", function(req, res) {
    console.log(req.decoded);
    console.log(req.params.claimid);
    if (req.params.claimid) {
        Claim.findById(req.params.claimid, function(err, claim) {
            console.log(claim);
            if (err) {
                return res.json({
                    success: false,
                    message: "Oops! You are trying something that is not supported"
                });
            } else {
                if (req.decoded.employeenumber === claim.empno || req.decoded.role === "super") {
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
    // forming query criteria
    if (req.decoded) {
        var filter = {};
        if (req.query.skip) {
            filter.skip = parseInt(req.query.skip);
        }
        if (req.query.limit) {
            filter.limit = parseInt(req.query.limit);
        }
        var criteria = {};
        var dateType = req.query.dateType ? req.query.dateType : "claimdate";
        if (req.decoded.role === "single") {
            criteria.empno = parseInt(req.decoded.employeenumber);
        } else if (req.query.empno && req.query.empno != "undefined") {
            criteria.empno = parseInt(req.query.empno);
        }
        if (req.query.claimno && req.query.claimno != "undefined") {
            criteria.claimno = req.query.claimno;
        }
        if (req.query.fromdate && req.query.fromdate !== "undefined") {
            criteria[dateType] = {};
            criteria[dateType]["$gte"] = new Date(req.query.fromdate)

        }
        if (req.query.fromdate && req.query.fromdate !== "undefined") {
            criteria[dateType] = {};
            criteria[dateType]["$gte"] = new Date(req.query.fromdate)

        }
        if (req.query.todate && req.query.todate !== "undefined") {
            if (!criteria[dateType]) {
                criteria[dateType] = {};
            }
            criteria[dateType]["$lte"] = new Date(req.query.todate)
        }
        console.log(JSON.stringify(criteria) + req.query.fromdate + req.query.todate);
        Claim.find(
            criteria, "empno claimno claimdate claimoffice claimname claimamount contactnum dischargedate reimbursedamount remarks", filter,
            function(err, claims) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    console.log(claims.length);
                    return res.json({
                        success: true,
                        claims: claims
                    });
                }
            })
    } else {
        return res.json({
            success: false,
            message: "Oops! You are trying something that is not supported"
        });
    }

});

router.post('/updateClaim/:claimId', function(req, res) {
    try {
        Claim.findById(req.params.claimId, function(err, claim) {
            if (err) {
                return res.json({
                    success: false,
                    message: "No such claim exist"
                });
            } else {
                console.log(claim);
                if (claim.empno === req.decoded.employeenumber || req.decoded.role === "super") {
                    claim.dischargedate = req.body.dischargedate;
                    claim.reimbursedamount = req.body.reimbursedamount;
                    // claim.claimno = req.body.claimno;
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
    } catch (err) {
        next();
    }

});

//add claim
router.post('/addClaim', function(req, res) {
    try {
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
                    newClaims.empno = employeeno;
                    newClaims.save(function(saveErr) {
                        if (saveErr) {
                            return res.json({
                                success: false,
                                message: saveErr
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
    } catch (err) {
        console.log(err);
        next();
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
        bold: true ``
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
                row.reimbursedamount ? row.reimbursedamount : '',
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