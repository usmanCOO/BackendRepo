const express = require("express");
const router = express.Router();
const DealController = require("../app/controllers/DealController");
const QuestionController = require("../app/controllers/QuestionController");
const QuestionResponseController = require("../app/controllers/QuestionResponseController");
const CommentController = require("../app/controllers/CommentController");
// const S3Upload = require("./utils/s3Upload.js");
const sharp = require("sharp");
const PaymentLogsController = require("../app/controllers/PaymentLogsController");
const VideoController = require("../app/controllers/VideoController");
const IosSubscriptionController = require("../app/controllers/IosSubscriptionController");
const AndroidSubscriptionController = require("../app/controllers/AndroidSubscriptionController");
const User = require("../models/User");
const base64url = require("base64url");

router.get("/getvideosforapp", VideoController.getVideosForApp);
router.post("/createpaymentintent", PaymentLogsController.createPaymentIntent);
router.post("/createpaymentlog", PaymentLogsController.createPaymentLogs);

router.post("/iosnotification", IosSubscriptionController.iosSubscriptions);
router.post("/iosnotification1", IosSubscriptionController.iosSubscriptions1);
router.post(
  "/addsubscriptionrecord",
  IosSubscriptionController.addInitialUserSubscription
);
router.get(
  "/checksubscriptionexpiry",
  IosSubscriptionController.checkSubscriptionExpiry
);
router.post(
  "/googleplay/webhooks",
  AndroidSubscriptionController.googlePlayWebhooks
);
router.post("/testfunction", AndroidSubscriptionController.testFunction);

router.post("/createlog", async (req, res) => {
  try {
    const { Logs } = req.db.models;
    const userID = req?.auth?.data?.userId;
    const { log_type, metadata } = req.body;

    Logs.create({
      log_type,
      metadata,
      userID,
    })
      .then((log) => {
        res.status(200).json({
          success: true,
          message: "Logs added to db",
          data: log,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          success: false,
          message: error,
        });
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
});

router.get("/getlogs", async (req, res) => {
  try {
    const { Logs } = req.db.models;
    Logs.findAll()
      .then((logs) => {
        res.status(200).send({
          message: "All logs are",
          success: true,
          logs,
        });
      })
      .catch((error) => {
        res.status(200).send({
          error,
        });
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
});

router.put("/updatedatedeal/:id", async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const deal_id = req.params.id;
    let date = new Date();
    date = date.toISOString();
    let result;
    console.log("Date is ", date);

    let deal = await Deal.findOne({
      where: {
        id: deal_id,
      },
    });

    if (deal) {
      console.log("updaint date");
      const newUpdatedAt = new Date();
      deal.changed("updatedAt", true);

      deal.update({ updatedAt: newUpdatedAt });
      //console.log("SAdasdas ", data);
      res.status(200).send({
        message: "Date updated",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
});

router.get("/getusersessions", async (req, res, next) => {
  try {
    const { UserSessions, Deal } = req.db.models;
    const userId = req?.auth?.data?.userId;
    UserSessions.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Deal,
          required: false,
        },
      ],
    })
      .then(async (sessions) => {
        if (sessions.length) {
          // res.redirect(process.env.VERIFY_RETURN_URL_FAIL)
          //const { fullName, id, email } = user;

          res.status(200).send({
            status: true,
            user_sessions: sessions,
            //user: { fullName, id, email, role: user.Role },
          });
        } else {
          res.status(200).send({
            status: false,
            user: null,
            message: "User sessions not found",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong", err });
  }
});

// router.put("/calendly", async (req, res) => {
//   try {
//     console.log("IN HERE");
//     const { Deal, UserSessions } = req.db.models;
//     //const Deal = db.Deal;
//     //const dealId = req?.params?.id;
//     let user_id = req.query.user_id;
//     let deal_id = req.query.deal_id;
//     //const { userId } = req?.auth?.data;
//     let deal;
//     let usersession;
//     console.log("User id is ", user_id);
//     console.log("Deal id is ", deal_id);

//     let { session_url, metadata } = req.body;

//     if (deal_id) {
//       deal = await Deal.findOne({
//         where: {
//           id: deal_id,
//         },
//       });

//       if (deal) {
//         let updatedeal = await Deal.update(
//           {
//             session_url: session_url ? session_url : deal.session_url,
//             metadata: metadata ? metadata : deal.metadata,
//           },
//           {
//             where: {
//               id: deal_id,
//             },
//           }
//         );
//       } else {
//         return res.status(404).json({
//           message: "Deal id Not Found",
//           success: false,
//           code: 111,
//         });
//       }
//     }

//     if (user_id && deal) {
//       usersession = await UserSessions.create({
//         session_url,
//         metadata,
//         deal_id,
//         user_id,
//       });
//     } else if (user_id) {
//       usersession = await UserSessions.create({
//         session_url,
//         metadata,
//         user_id,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Query params data invalid",
//         success: false,
//         code: 111,
//       });
//     }

//     if (usersession) {
//       return res.status(200).json({
//         message: "User session stored",
//         success: true,
//         data: usersession,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Cannot create user Session",
//         success: false,
//         code: 111,
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

router.get("/get_deal_questions", async (req, res) => {
  const { Category, CategoryLabel, Question } = req.db.models;
  const deal_data = await Category.findAll({
    order: [["order", "ASC"]],
    include: [
      { model: CategoryLabel },
      {
        model: Question,
        required: false,
      },
    ],
  });
  res.status(200).send({ data: deal_data, status: true });
});
router.post("/create_deal", DealController.createDeals);
router.get("/deals/:dealId", DealController.getDeals);
router.get("/userdeals/:filter", DealController.userDeals);
router.get("/shareddealpage/:dealId", DealController.sharedDealPage);
router.get("/deals", DealController.dealAnalysisForApp);
router.delete("/deals/:dealId", DealController.delDeals);
router.post("/deals/save", DealController.saveDeal);
router.post("/deals/submit", DealController.submitDealForReview);
router.patch("/deals/update/:dealid", DealController.updateDeals);

router.post("/deals/draft", QuestionController.saveQuestionResponse);
router.get(
  "/deals/:dealId/response",
  QuestionResponseController.getResponseById
);
router.get(
  "/deals/:dealId/responsev2",
  QuestionResponseController.getResponseByIdV2
);
router.post("/deals/shareDeal", DealController.shareDealWithUser);
router.patch("/deals/status", DealController.updateDealStatus);
router.get("/deals_shared/:filter", DealController.getShareDealWithUser);
router.delete(
  "/delete_deals_shared/:dealId",
  DealController.deleteShareDealWithUser
);
router.get("/my_shared_deals/:filter", DealController.getMyShareDeals);
router.delete(
  "/delete_my_deals_shared/:dealId/:shareduser",
  DealController.deleteMyShareDeal
);

router.post("/comment", CommentController.addComment);

router.get("/comment/:deal_id", CommentController.getComment);

router.post("/upload", async (req, res) => {
  let isMulti = req.body.isMulti;
  let uploadPath = req.body.uploadPath;
  const { userId } = req?.auth?.data;
  let uploads = [];
  try {
    if (!req?.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    }
    //else if (isMulti == 'true') {
    //   let data = [];

    //   //loop all files
    //   _.forEach(_.keysIn(req.files.photos), (key) => {
    //     let photo = req.files.photos[key];
    //     let promise = S3Upload(
    //       req.files.photos[key].data,
    //       "userProfile/" + req.files.photos[key].name, key
    //     ).then((uploadResponse) => {
    //       console.log("upload resposne", uploadResponse);
    //       if (uploadResponse["key"]) {
    //         data[uploadResponse["key"]].url = uploadResponse.url
    //       }
    //     });
    //     uploads.push(promise);
    //     //push file details
    //     data.push({
    //       name: photo.name,
    //       mimetype: photo.mimetype,
    //       size: photo.size,
    //     });
    //   });
    //   Promise.all(uploads)
    //     .then(async function () {
    //       console.log(data);
    //       res.send({
    //         status: true,
    //         message: "Files are uploaded",
    //         data: data,
    //       });
    //     })
    //     .catch(function (err) {
    //       console.log(err);
    //       res.send(err);
    //     });
    //   //return response
    // } else if (isMulti == 'false')

    {
      let data = [];

      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let photo = req.files.photo;
      var fs = require("fs");
      var dir = `./public/uploads/${userId}`;
      var imageName = Date.now() + "_" + userId;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      sharp(photo.data)
        .resize(320, 240)
        .toFile(dir + "/" + imageName + ".webp", async (err, info) => {
          console.log("err", err);
          if (err) {
            console.log("err", err);
            return res.status(500).send(err);
          }
          const { User } = req.db.models;
          console.log("userId", userId);
          const userExist = await User.findOne({ where: { id: userId } });
          await userExist.update({
            profilePhoto: "uploads/" + userId + "/" + imageName + ".webp",
          });
          console.log("userExist", userExist);
          //send response
          res.send({
            status: true,
            message: "File is uploaded",
            data: {
              name: imageName + ".webp",
              mimetype: photo.mimetype,
              size: photo.size,
            },
          });
        });
      // photo.mv();
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send(err);
  }
});
module.exports = router;
