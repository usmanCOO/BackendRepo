const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/AuthController");
const DealController = require("../app/controllers/DealController");

var singleUpload = require("../middlewares/image.js");

var verifyToken = require("../app/middlewares/isAuth.js");

// router.get('/login', AuthController.loginPage);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/verify", AuthController.accountVerify);
// router.get('/sign-up', AuthController.signUpPage);
router.post("/sign-up", AuthController.signUp);
// router.get('/forgot-password', AuthController.forgotPasswordPage);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

router.post("/createquestion", AuthController.createQuestions);
router.put("/updatequestion/:question_id", AuthController.updateQuestions);
router.get("/getquestion/:catId", AuthController.getQuestions);
router.delete("/deletequestion/:question_id", AuthController.deleteQuestions);

router.post("/applesignin", AuthController.appleSignIn);
router.put("/updateuser", singleUpload, AuthController.updateUser);
router.get("/getuser", AuthController.getUsers);
router.delete("/deluser", AuthController.delUsers);
router.post("/postsubscription", AuthController.postSubscription);
router.get("/getsubscription", AuthController.getSubscription);
//router.imgDel('/imgDel', AuthController.imgDel);

module.exports = router;
