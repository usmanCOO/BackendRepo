const express = require("express");
const router = express.Router();
const path = require("path");
const AdminController = require("../app/controllers/AdminController");
const DealController = require("../app/controllers/DealController");
const VideoController = require("../app/controllers/VideoController");
var verifyToken = require("../app/middlewares/isAuth.js");

var verifyRole = require("../app/middlewares/isAuth.js");
const PaymentLogsController = require("../app/controllers/PaymentLogsController");
const Deal = require("../models/Deal");

//router.post("/createpaymentintent", PaymentLogsController.createPaymentIntent);
//router.post("/", AdminController.createUser);
router.get("/highlypurchasedvideo", AdminController.highlyPurchasedVideo);
router.get("/dashboardapi", AdminController.dashboardApis);
router.get("/countusers", AdminController.numberUsers);
router.get("/countadmins", AdminController.numberAdmins);
router.get("/ndaysearning/:days", PaymentLogsController.getLastNDaysEarnings);
router.get("/eachmonthearnings", PaymentLogsController.getEachMonthEarnings);
router.get("/getpaymentlog", PaymentLogsController.getAllPayemntlogs);
router.get("/viewadmins", AdminController.ViewAllAdmins);
router.post("/addadmin", verifyRole, AdminController.AddAdmin);
router.put("/editadmin/:id", verifyRole, AdminController.EditAdmin);
router.delete("/deleteadmin/:id", verifyRole, AdminController.DeleteAdmin);
router.get("/viewusers", AdminController.ViewUsersAdmin);
router.get(`/getvideo`, VideoController.getVideos);
//router.post("/videoimage", VideoController.upload);
// router.post(
//   "/videoimage",
//   VideoController.imageUpload,
//   (req, res) => {
//     res.send(req.files.filename);
//   },
//   (error, req, res, next) => {
//     console.log("res is ", res);
//     console.log("Here in error image upload ", error);
//     res.status(400).send({ error: error });
//   }
// );

router.post("/vimageupload", VideoController.imageVideo);

router.post(`/createvideo`, VideoController.createVideo);
router.put(`/editvideo/:id`, VideoController.editVideo);
router.delete(`/deletevideo/:id`, VideoController.deleteVideo);

module.exports = router;
