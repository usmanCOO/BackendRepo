const base64url = require("base64url");

const decodeSignedData = (encodedStr) => {
  let splitedStr = encodedStr.split(".")[1];
  let decodedStr = JSON.parse(base64url.decode(splitedStr));

  console.log("decoded data is ", decodedStr);
  return decodedStr;
};

const addSubscriptionRecord = async (signedPayload, IosSubscription) => {
  const bodyData = decodeSignedData(signedPayload);

  //console.log("Whole object stored in table for metadata ", obj);

  // console.log("Req body is subscription ", bodyData);
  let notificationType = bodyData?.notificationType;
  let subtype = bodyData?.subtype;
  console.log("subtype is ", subtype);
  console.log("downgrade data is ", bodyData);

  if (subtype || notificationType) {
    let data = bodyData?.data;
    let decodedSignedTransactionInfo = data?.signedTransactionInfo;
    let decodedSignedRenewalInfo = data?.signedRenewalInfo;
    decodedSignedTransactionInfo = decodeSignedData(
      decodedSignedTransactionInfo
    );
    decodedSignedRenewalInfo = decodeSignedData(decodedSignedRenewalInfo);

    console.log("signed transaction data is ", decodedSignedTransactionInfo);
    console.log("signed Renewal data is ", decodedSignedRenewalInfo);
    data.signedTransactionInfo = decodedSignedTransactionInfo;
    data.signedRenewalInfo = decodedSignedRenewalInfo;

    let subscriptionObj = await IosSubscription.create({
      notificationType,
      subtype,
      transactionId: decodedSignedTransactionInfo?.transactionId,
      originalTransactionId:
        decodedSignedTransactionInfo?.originalTransactionId,
      purchaseDate: decodedSignedTransactionInfo?.purchaseDate,
      originalPurchaseDate: decodedSignedTransactionInfo?.originalPurchaseDate,
      expiresDate: decodedSignedTransactionInfo?.expiresDate,
      metadata: {
        notificationType,
        subtype,
        data,
      },
    });

    console.log("Subscription data is inserted ", subscriptionObj);
    return {
      notificationType,
      subtype,
      originalTransactionId:
        decodedSignedTransactionInfo?.originalTransactionId,
      purchaseDate: decodedSignedTransactionInfo?.purchaseDate,
      expiresDate: decodedSignedTransactionInfo?.expiresDate,
    };
  }

  return {};
};

const updateUserFunc = async (
  isSub,
  tId,
  startDate,
  endDate,
  message,
  User
) => {
  let userUpdate = await User.update(
    {
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      isSubscriptionValid: isSub,
      subscriptionMessage: message,
    },
    {
      where: {
        originalTransactionId: tId,
      },
    }
  );

  console.log(
    "Updated user on Apple server to server notifications is ",
    userUpdate
  );
};

exports.iosSubscriptions = async (req, res, next) => {
  try {
    // console.log("res is ", req);
    const { IosSubscription, Metadata, User } = req.db.models;

    let obj = await Metadata.create({
      metadata: req?.body ? req.body : {},
    });

    if (req.body.signedPayload) {
      //call add subscription
      let data = await addSubscriptionRecord(
        req.body.signedPayload,
        IosSubscription
      );
      console.log("function response is ", data);

      if (
        data?.notificationType === "SUBSCRIBED" &&
        data?.subtype === "RESUBSCRIBE"
      ) {
        await updateUserFunc(
          true,
          data.originalTransactionId,
          data.purchaseDate,
          data.expiresDate,
          "You have resubscribed to the subscription",
          User
        );
      } else if (
        data?.notificationType === "DID_RENEW" &&
        (data?.subtype === "" || data?.subtype === "BILLING_RECOVERY")
      ) {
        /*DID_RENEW 
        A notification type that, along with its subtype, indicates that the subscription successfully renewed. 
        If the subtype is BILLING_RECOVERY, the expired subscription that previously failed to renew has successfully
        renewed. If the substate is empty, the active subscription has successfully auto-renewed for a new transaction
        period. Provide the customer with access to the subscriptions content or service.
      */
        await updateUserFunc(
          true,
          data.originalTransactionId,
          data.purchaseDate,
          data.expiresDate,
          "Your subscription has been renewed",
          User
        );
        console.log("renewed");
      } else if (data?.notificationType === "EXPIRED") {
        /*EXPIRED
        A notification type that, along with its subtype, indicates that a subscription expired.
        If the subtype is VOLUNTARY, the subscription expired after the user disabled subscription renewal.
        If the subtype is BILLING_RETRY, the subscription expired because the billing retry period ended
        without a successful billing transaction. If the subtype is PRICE_INCREASE, the subscription expired
        because the user didn’t consent to a price increase that requires user consent. If the subtype is
        PRODUCT_NOT_FOR_SALE, the subscription expired because the product wasn’t available for purchase at the
        time the subscription attempted to renew.
        A notification without a subtype indicates that the subscription expired for some other reason.
        */
        await updateUserFunc(
          false,
          data.originalTransactionId,
          data.purchaseDate,
          data.expiresDate,
          "Your subscription is expired.",
          User
        );
        console.log("User subscription is expired");
      } else if (data?.notificationType === "DID_CHANGE_RENEWAL_STATUS") {
        /*
        DID_CHANGE_RENEWAL_STATUS
        A notification type that, along with its subtype, indicates that the user made a change to the subscription
        renewal status. If the subtype is AUTO_RENEW_ENABLED, the user reenabled subscription auto-renewal. If the
        subtype is AUTO_RENEW_DISABLED, the user disabled subscription auto-renewal, or the App Store disabled
        subscription auto-renewal after the user requested a refund.
        */
        console.log("autorenew changed");
      } else if (data?.notificationType === "DID_CHANGE_RENEWAL_PREF") {
        /*
        A notification type that, along with its subtype, indicates that the user made a change to their
        subscription plan. If the subtype is UPGRADE, the user upgraded their subscription, or cross-graded
        to a subscription with the same duration. The upgrade goes into effect immediately, starting a 
        new billing period, and the user receives a prorated refund for the unused portion of the previous period.
        If the subtype is DOWNGRADE, the user downgraded their subscription or cross-graded to a subscription with
        a different duration. Downgrades take effect at the next renewal date and don’t affect the currently active plan.
        If the subtype is empty, the user changed their renewal preference back to the current subscription,
        effectively canceling a downgrade.
        */
        console.log("user changed its subscription upgrade or downgrade");
      } else if (data?.notificationType === "GRACE_PERIOD_EXPIRED") {
        /*
        A notification type that indicates that the billing grace period has ended without renewing the
        subscription, so you can turn off access to the service or content. Inform the user that there may 
        be an issue with their billing information. The App Store continues to retry billing for 60 days, 
        or until the user resolves their billing issue or cancels their subscription, whichever comes first.
        */
        await updateUserFunc(
          false,
          data.originalTransactionId,
          data.purchaseDate,
          data.expiresDate,
          "Your subscription is in grace period,that's why you can't create any deal",
          User
        );
      } else {
        console.log("no type matched");
      }
    }

    return res.status(200).send({
      success: true,
      message: "Ios notification received 11",
      //   decodedSignedTransactionInfo,
      //   decodedSignedRenewalInfo,
    });
  } catch (error) {
    console.log("Error in ios notification ", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

exports.iosSubscriptions1 = async (req, res, next) => {
  try {
    // console.log("res is ", req);

    const data = decodeSignedData(req.body.signedPayload);
    console.log("Data is ", data);

    return res.status(200).send({
      success: true,
      message: "Ios notification received",
      //   decodedSignedTransactionInfo,
      //   decodedSignedRenewalInfo,
    });

    // if (req?.body?.signedPayload) {
    //   const jws_string = req.body.signedPayload;
    //   const jws_payload = jws_string.split(".")[1];

    //   const payload = JSON.parse(base64url.decode(jws_payload));

    //   console.log("Payload Data is ", payload);

    //   return res.status(200).send({
    //     success: true,
    //     message: "Ios notification received",
    //     payload,
    //   });
    // } else {
    //   return res.status(500).send({
    //     success: false,
    //     message: "np notification received",
    //   });
    // }
  } catch (error) {
    console.log("Error in ios notification ", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

exports.addInitialUserSubscription = async (req, res, next) => {
  try {
    const userId = req?.auth?.data?.userId;
    const { UserSubscriptions, User } = req.db.models;
    const {
      originalTransactionId,
      subscriptionStartDate,
      subscriptionEndDate,
      platformSubscriptionName,
    } = req.body;

    let data = await UserSubscriptions.create({
      originalTransactionId,
      userId,
    });

    let userUpdate = await User.update(
      {
        originalTransactionId: originalTransactionId,
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate,
        platformSubscriptionName: platformSubscriptionName,
        isSubscriptionValid: true,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    console.log("Updated user is ", userUpdate);

    if (data && userUpdate) {
      return res.status(200).send({
        success: true,
        message: "New subscription record added",
        data,
        userUpdate,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No subscription record added",
      });
    }
  } catch (error) {
    console.log("in initial buy subscription error ", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

exports.checkSubscriptionExpiry = async (req, res, next) => {
  try {
    const userId = req?.auth?.data?.userId;
    const { User } = req.db.models;
    const latestSubscription = await User.findOne({
      where: {
        id: userId,
      },
    });

    console.log("latest subscription is ", latestSubscription);
    if (latestSubscription) {
      let currentTime = Date.now();
      if (currentTime > latestSubscription?.subscriptionEndDate) {
        return res.status(200).send({
          success: false,
          message: "User subscription is expired",
          latestSubscription,
        });
      } else {
        return res.status(200).send({
          success: true,
          message: "User can create deals,subscription is valid",
          latestSubscription,
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "User subscription record ",
      });
    }
  } catch (error) {
    console.log("check subscription expiry error ", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};
