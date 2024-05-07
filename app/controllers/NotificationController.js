const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");
// const { url } = require("inspector");

exports.getNotification = async (req, res) => {
  try {
    const { User, Comment, Shared_Deals, Notification, Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    console.log("Here not ", userId);
    let notification = await Notification.findAll({
      where: {
        send_to: userId,
        read_status: false,
      },
      include: [
        {
          model: Deal,
          attributes: ["deal_name"],
        },
        {
          model: Comment,
          attributes: ["statement"],
        },
      ],
    });

    if (notification.length) {
      return res.status(200).send({
        success: true,
        message: "Your unread notifications",
        notification,
        unread: notification.length,
      });
    } else {
      res.status(200).send({
        success: false,
        message: "You have not any unread notifications",
      });
    }
  } catch {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const { User, Comment, Shared_Deals, Notification, Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    const dealId = req.params.dealId;
    console.log("dealId is ", dealId);

    let read = await Notification.findAll({
      where: {
        send_to: userId,
        read_status: false,
        deal_Id: dealId,
      },
    });

    if (read.length) {
      let updatereadstatus = await Notification.update(
        {
          read_status: true,
        },
        {
          where: {
            send_to: userId,
            read_status: false,
            deal_Id: dealId,
          },
        }
      );

      if (updatereadstatus[0]) {
        return res.status(200).send({
          success: true,
          message: "All notifications are read",
          updatereadstatus,
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "No unread notifications to read",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "You haven't any unread notifications",
      });
    }
  } catch {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

// exports.CreateNotifications = async (req, res, next) => {
//   try {
//     const { Notification } = req.db.models;
//     console.log(req.body);
//     const {
//       message,
//       notification_type,
//       url,
//       read_status,
//       created_by,
//       send_to,
//       deal_Id,
//     } = req.body;

//     Notification.create({
//       message,
//       notification_type,
//       url,
//       read_status,
//       created_by,
//       send_to,
//       deal_Id,
//     })
//       .then((not_msg) => {
//         res.status(200).json({
//           success: true,
//           message: "Notification created",
//           data: not_msg,
//         });
//       })
//       .catch((error) => {
//         return res.status(400).send({
//           success: false,
//           message: error,
//         });
//       });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//     });
//   }
// };

// exports.updateNotification = async (req, res, next) => {
//   try {
//     const { Notification } = req.db.models;
//     const {
//       message: messageReq,
//       notification_type: notification_typeReq,
//       url: urlReq,
//       read_status: read_statusReq,
//     } = req.body;

//     const notificationEditId = req?.params?.id;

//     Notification.findOne({
//       where: {
//         id: notificationEditId,
//       },
//     })
//       .then(async (ntf_msg) => {
//         if (ntf_msg) {
//           await Notification.update(
//             {
//               message: messageReq ? messageReq : ntf_msg.message,
//               notification_type: notification_typeReq
//                 ? notification_typeReq
//                 : ntf_msg.notification_type,
//               url: urlReq ? urlReq : ntf_msg.url,
//               read_status: read_statusReq
//                 ? read_statusReq
//                 : ntf_msg.read_status,
//             },
//             {
//               where: {
//                 id: notificationEditId,
//               },
//             }
//           );

//           Notification.findOne({
//             where: {
//               id: notificationEditId,
//             },
//           })
//             .then((updatedNotification) => {
//               if (updatedNotification) {
//                 res.status(200).json({
//                   success: true,
//                   message: "Notification Updated",
//                   data: updatedNotification,
//                 });
//               } else {
//                 return res.status(200).send({
//                   success: false,
//                   message: "Canot update Notification Something went Wrong",
//                 });
//               }
//             })
//             .catch((err) => {
//               return res.status(200).json({
//                 message: `try/catch err: ${error}`,
//                 success: false,
//               });
//             });
//         } else {
//           res
//             .status(200)
//             .send({ success: false, message: "Cannot Edit notification" });
//         }
//       })
//       .catch((error) => {
//         return res.status(200).json({
//           message: `try/catch err: ${error}`,
//           success: false,
//         });
//       });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//     });
//   }
// };

// exports.deleteNotification = async (req, res, next) => {
//   try {
//     const notificationDeleteId = req?.params?.id;
//     const { Notification } = req.db.models;

//     let notification = await Notification.findOne({
//       where: {
//         id: notificationDeleteId,
//       },
//     });

//     if (notification) {
//       Notification.destroy({
//         where: {
//           id: notificationDeleteId,
//         },
//       });

//       return res
//         .status(200)
//         .send({ success: true, message: "Notification deleted successfully" });
//     } else {
//       return res.status(200).send({
//         success: false,
//         message: "Cannot delete notification",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//     });
//   }
// };

// exports.ViewAllNotifications = (req, res, next) => {
//   try {
//     const { Notification, User, Deal } = req.db.models;

//     Notification.findAll({
//       include: [
//         {
//           model: User,
//           as: "creator",
//           attributes: ["fullName"],
//         },
//         {
//           model: User,
//           as: "receiver",
//           attributes: ["fullName"],
//         },
//         {
//           model: Deal,
//           attributes: ["deal_name"],
//         },
//       ],
//     })
//       .then((notifications) => {
//         console.log("Notifications are");
//         console.log(notifications);
//         if (notifications?.length > 0) {
//           res.status(200).json({
//             success: true,
//             message: "All Notifications Displayed",
//             notification_data: notifications,
//           });
//         } else {
//           res
//             .status(200)
//             .send({ success: false, message: "No Notifications found" });
//         }
//       })
//       .catch((error) => {
//         res.status(200).json({
//           success: false,
//           message: "Error getting Notifications",
//           data: error,
//         });
//       });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//     });
//   }
// };
