const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/AuthController");
const db = require("../models/index");
var jwttoken = require("jsonwebtoken");

router.get("/ping", (req, res) => {
  res.status(200).send("Server is accessable !!");
});

router.get("/user", AuthController.getUser);
router.get("/searchud", async (req, res) => {
  try {
    const Deal = db.Deal;
    const User = db.User;
    // let user_id = req.query.user_id;
    let deal_id = req.query.deal_id;
    let token = req.query.token;
    let userData;
    let dealData;

    const data = jwttoken.verify(token, process.env.JWT_TOKEN_KEY);
    let user_id = data.data.userId;
    console.log("asdas ", data.data.userId);
    console.log("user id is ", typeof user_id);

    userData = await User.findOne({
      where: {
        id: user_id,
      },
    });

    if (deal_id) {
      dealData = await Deal.findOne({
        where: {
          id: deal_id,
        },
      });
    }

    if (userData && dealData) {
      return res.status(200).send({
        success: true,

        message: "User and Deal exist",
      });
    }
    if (userData && !deal_id) {
      return res.status(200).send({
        success: true,

        message: "User exist",
      });
    } else {
      return res.status(200).send({
        success: false,

        message: "Error",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 113,
    });
  }
});
router.put("/calendly", async (req, res) => {
  try {
    const Deal = db.Deal;
    const User = db.User;
    const UserSessions = db.UserSessions;
    const { metadata, session_url } = req.body;
    // let user_id = req.query.user_id;
    let deal_id = req.query.deal_id;
    let token = req.query.token;
    let userData;
    let dealData;

    const data = jwttoken.verify(token, process.env.JWT_TOKEN_KEY);
    let user_id = data.data.userId;
    console.log("asdas ", data.data.userId);
    console.log("user id is ", typeof user_id);

    if (deal_id && user_id) {
      console.log("double if");
      userData = await UserSessions.create({
        metadata,
        session_url,
        user_id,
        deal_id,
      });

      dealData = await Deal.update(
        {
          metadata,
          session_url,
        },
        {
          where: {
            id: deal_id,
          },
        }
      );

      return res.status(200).send({
        success: true,
        dealData,
        userData,
        message: "User and Deal exist",
      });
    }
    if (user_id && !deal_id) {
      console.log("Single if");
      userData = await UserSessions.create({
        metadata,
        session_url,
        user_id,
      });

      return res.status(200).send({
        success: true,
        userData,
        message: "User exist",
      });
    } else {
      return res.status(200).send({
        success: false,

        message: "Error",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 113,
    });
  }
});

module.exports = router;
