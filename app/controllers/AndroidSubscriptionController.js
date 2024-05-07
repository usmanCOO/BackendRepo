const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");
const json = require("json");
const buffer = require("buffer");
// const User = require("../../models/User");
// const Metadata = require("../../models/Metadata");
const env = require("dotenv");
env.config();
const {
  getSubcriptionInformation,
} = require("../../helpers/getSubscriptionInformation");

const updateUserFunc = async (
  purchaseToken,
  subscriptionId,
  packageName,
  isSub,
  message,
  User
) => {
  console.log("In update function");
  const subscriptionInfo1 = await getSubcriptionInformation(
    purchaseToken,
    subscriptionId,
    packageName
  );
  console.log("subscriptionInfo1 ", subscriptionInfo1);
  if (subscriptionInfo1?.obfuscatedExternalAccountId) {
    const updatedUser = await User.update(
      {
        isSubscriptionValid: isSub,
        subscriptionMessage: message,
      },
      {
        where: { email: subscriptionInfo1?.obfuscatedExternalAccountId },
      }
    );
    console.log("updatedUser if is ", updatedUser);
  } else {
    const updatedUser = await User.update(
      {
        isSubscriptionValid: isSub,
        subscriptionMessage: message,
      },
      {
        where: { originalTransactionId: purchaseToken },
      }
    );
    console.log("updatedUser else is ", updatedUser);
  }
};

exports.googlePlayWebhooks = async (req, res, next) => {
  try {
    const { IosSubscription, Metadata, User } = req.db.models;
    console.log("req.body ", req.body);

    // let obj = await Metadata.create({
    //   metadata: req?.body ? req.body : {},
    // });

    const data = req.body;
    console.log("it got hit ", data.message.data);
    // decoding buffer data from googple play
    const decodedData = JSON.parse(
      await new Buffer(data.message.data, "base64").toString("utf-8")
    );
    console.log("decodedData ", decodedData);
    //Getting subscriptionObject if exists otherwise it would be oneTimeProductObject
    const subscriptionObject = decodedData.subscriptionNotification;
    const oneTimeProductObject = decodedData.OneTimeProductNotification;
    const packageName = decodedData.packageName;
    if (subscriptionObject) {
      console.log("subscriptionObject ", subscriptionObject);
      const purchaseToken = subscriptionObject.purchaseToken;
      const subscriptionId = subscriptionObject.subscriptionId;
      const notificationType = subscriptionObject.notificationType;
      switch (notificationType) {
        case 1: //SUBSCRIPTION_RECOVERED
          //purchaseToken,subscriptionId,packageName,isActivesubscription check,message,Model
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            true,
            "Your subscription has been recovered",
            User
          );
          break;
        case 2: //SUBSCRIPTION_RENEWED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            true,
            "Your subscription has been renewed",
            User
          );
          break;
        case 3: //SUBSCRIPTION_CANCELED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "You cancelled your subscription",
            User
          );
          break;
        case 4: //SUBSCRIPTION_PURCHASED
          const subscriptionInfo4 = await getSubcriptionInformation(
            purchaseToken,
            subscriptionId,
            packageName
          );
          console.log("subscriptionInfo4 ", subscriptionInfo4);
          if (subscriptionInfo4?.obfuscatedExternalAccountId) {
            const updatedUser = await User.update(
              {
                originalTransactionId: purchaseToken,
                platformSubscriptionName: "android",
                isSubscriptionValid: true,
                subscriptionMessage: "you have subscribed",
              },
              {
                where: {
                  email: subscriptionInfo4?.obfuscatedExternalAccountId,
                },
              }
            );
          }
          //attach purchase token to db
          break;
        case 5: //SUBSCRIPTION_ON_HOLD
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "Your subscription is on hold",
            User
          );
          break;
        case 6: //SUBSCRIPTION_IN_GRACE_PERIOD
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "Your subscription is in grace period,that's why you can't create any deal",
            User
          );
          break;
        case 7: //SUBSCRIPTION_RESTARTED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            true,
            "Your subscription is restarted",
            User
          );
          break;
        case 8: //SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
          const subscriptionInfo8 = await getSubcriptionInformation(
            purchaseToken,
            subscriptionId,
            packageName
          );
          console.log("subscriptionInfo8 ", subscriptionInfo8);
          break;
        case 9: //SUBSCRIPTION_DEFERRED
          const subscriptionInfo9 = await getSubcriptionInformation(
            purchaseToken,
            subscriptionId,
            packageName
          );
          console.log("subscriptionInfo9 ", subscriptionInfo9);

          break;
        case 10: //SUBSCRIPTION_PAUSED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "You have paused your subscription.",
            User
          );
          break;
        case 11: //SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
          break;
        case 12: //SUBSCRIPTION_REVOKED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "Your subscription has been revoked",
            User
          );
          break;
        case 13: //SUBSCRIPTION_EXPIRED
          await updateUserFunc(
            purchaseToken,
            subscriptionId,
            packageName,
            false,
            "Your subscription is expired.",
            User
          );
          break;
        default:
          console.log("Unhandled event type:", notificationType);
      }
      console.log("I am here");
      return res.status(200).send({ message: "Renewal subscription response" }); //Sending ok response
    } else if (oneTimeProductObject) {
      console.log("oneTimeProductObject ", oneTimeProductObject);
      const purchaseToken = oneTimeProductObject.purchaseToken;
      const notificationType = oneTimeProductObject.notificationType;
      switch (notificationType) {
        case 1: //ONE_TIME_PRODUCT_PURCHASED
          break;
        case 2: //ONE_TIME_PRODUCT_CANCELED
          break;
        default:
          console.log("Unhandled event type:", notificationType);
      }
      return res.status(200).send({ message: "One Time Payment response" }); //Sending ok response
    } else {
      return res.status(200).send({ message: "" }); //Sending ok response
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: "Sorry! Something went wrong.",
      error: err.message,
    });
  }
};

exports.testFunction = async (req, res, next) => {
  const { purchaseToken, subscriptionId, packageName } = req.body;
  const getSubcriptionInformationResponse = await getSubcriptionInformation(
    purchaseToken,
    subscriptionId,
    packageName
  );
  console.log(
    "getSubcriptionInformationResponse ",
    getSubcriptionInformationResponse
  );
  try {
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.sendStatus(400);
  }
};
