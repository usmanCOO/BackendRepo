const path = require("path");
var cors = require("cors");
var fs = require("fs");
// load dependencies
var cors = require("cors");

const env = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
var { expressjwt: jwt } = require("express-jwt");
var jwttoken = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const db = require("./models/index");

// const jwt = require("jsonwebtoken");

//start here
// const privateKey = fs.readFileSync("./SubscriptionKey_KLQ2BJ475Q.p8"); // this is the file you can only download once and should treat like a real, very precious key.
// const apiKeyId = "KLQ2BJ475Q";
// const issuerId = "942f942e-49a2-4d66-a4c9-b1a29588a07a";
// let now = Math.round(new Date().getTime() / 1000); // Notice the /1000

// console.log("now is ", now);

// let nowPlus20 = now + 1199; // 1200 === 20 minutes

// console.log("Time is ", nowPlus20);
// let dataq = new Date(nowPlus20);
// console.log("new tine is ", dataq);

// let payload = {
//   iss: issuerId,
//   iat: now,
//   exp: nowPlus20,
//   aud: "appstoreconnect-v1",
//   bid: "come.medpicc.dealdoc",
// };

// let signOptions = {
//   algorithm: "ES256", // you must use this algorithm, not jsonwebtoken's default
//   header: {
//     alg: "ES256",
//     kid: apiKeyId,
//     typ: "JWT",
//   },
// };

// console.log("Signinoptionsa r ", signOptions);

// let token = jwttoken.sign(payload, privateKey, signOptions);
// console.log("@token: ", token);
//end here

// const issuer = "942f942e-49a2-4d66-a4c9-b1a29588a07a";
// const audience = "appstoreconnect-v2";
// const expiresIn = "20m";
// const expiresInSeconds = parseInt(expiresIn) * 60;

// const pemFile = fs.readFileSync("AuthKey_29Q87VGAYB.p8");
// const secretKeyFromPem = Buffer.from(pemFile).toString("utf8");

// console.log("Secret pem file is ", secretKeyFromPem);

// const claims = {
//   iss: issuer,
//   aud: audience,
//   exp: expiresInSeconds,
// };

// const token = jwttoken.sign(claims, secretKeyFromPem, {
//   algorithm: "ES256",
// });

// console.log("Token is ", token);

//const fileUpload = require("express-fileupload");

// default options

const app = express();

//Loading Routes
const webRoutes = require("./routes/web");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const dealRoutes = require("./routes/deal");
const appRoutes = require("./routes/app");
const { sequelize } = require("./models/index");
const categoryRoutues = require("./routes/category");
const notificationRoutues = require("./routes/notification");

const errorController = require("./app/controllers/ErrorController");
app.use(cors());

env.config();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "Images")));
app.use("/Images", express.static("Images"));
app.use(bodyParser.json());
// app.use(
//   fileUpload({
//     createParentPath: true,
//   })
// );

app.use(fileUpload());

// app.get("/searchud", async (req, res) => {
//   try {
//     const Deal = db.Deal;
//     const User = db.User;
//     // let user_id = req.query.user_id;
//     let deal_id = req.query.deal_id;
//     let token = req.query.token;
//     let userData;
//     let dealData;

//     const data = jwttoken.verify(token, process.env.JWT_TOKEN_KEY);
//     let user_id = data.data.userId;
//     console.log("asdas ", data.data.userId);
//     console.log("user id is ", typeof user_id);

//     userData = await User.findOne({
//       where: {
//         id: user_id,
//       },
//     });

//     if (deal_id) {
//       dealData = await Deal.findOne({
//         where: {
//           id: deal_id,
//         },
//       });
//     }

//     if (userData && dealData) {
//       return res.status(200).send({
//         success: true,

//         message: "User and Deal exist",
//       });
//     }
//     if (userData && !deal_id) {
//       return res.status(200).send({
//         success: true,

//         message: "User exist",
//       });
//     } else {
//       return res.status(200).send({
//         success: false,

//         message: "Error",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 113,
//     });
//   }
// });
// app.put("/calendly", async (req, res) => {
//   try {
//     const Deal = db.Deal;
//     const User = db.User;
//     const UserSessions = db.UserSessions;
//     const { metadata, session_url } = req.body;
//     // let user_id = req.query.user_id;
//     let deal_id = req.query.deal_id;
//     let token = req.query.token;
//     let userData;
//     let dealData;

//     const data = jwttoken.verify(token, process.env.JWT_TOKEN_KEY);
//     let user_id = data.data.userId;
//     console.log("asdas ", data.data.userId);
//     console.log("user id is ", typeof user_id);

//     if (deal_id && user_id) {
//       console.log("double if");
//       userData = await UserSessions.create({
//         metadata,
//         session_url,
//         user_id,
//         deal_id,
//       });

//       dealData = await Deal.update(
//         {
//           metadata,
//           session_url,
//         },
//         {
//           where: {
//             id: deal_id,
//           },
//         }
//       );

//       return res.status(200).send({
//         success: true,
//         dealData,
//         userData,
//         message: "User and Deal exist",
//       });
//     }
//     if (user_id && !deal_id) {
//       console.log("Single if");
//       userData = await UserSessions.create({
//         metadata,
//         session_url,
//         user_id,
//       });

//       return res.status(200).send({
//         success: true,
//         userData,
//         message: "User exist",
//       });
//     } else {
//       return res.status(200).send({
//         success: false,

//         message: "Error",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 113,
//     });
//   }
// });

app.use(
  jwt({
    secret: process.env.JWT_TOKEN_KEY,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/searchud",
      "/api/calendly",
      "/api/auth/updatecalendly",
      "/api/auth/sign-up",
      "/api/auth/login",
      "/api/auth/reset-password",
      "/api/auth/forgot-password",
      "/api/auth/verify",
      "/api/test",
      "/api/auth/applesignin",
      "/api/app/iosnotification",
      "/api/app/iosnotification1",
      "/api/app/googleplay/webhooks",
    ],
  })
);

app.use((req, res, next) => {
  req.db = sequelize;
  next();
});
app.use("/api", webRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/deal", dealRoutes);

app.use("/api/admin/", adminRoutes);
app.use("/api/app/", appRoutes);

app.use("/api/category", categoryRoutues);

app.use("/api/notification", notificationRoutues);

sequelize
  .sync({ alter: true })
  // .sync()
  .then(() => {
    app.listen(process.env.PORT);
    //pending set timezone
    console.log("App listening on port " + process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });
