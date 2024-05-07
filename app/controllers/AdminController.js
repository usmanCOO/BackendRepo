const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");
const sequelize = require("sequelize");
const sendMail = require("../../helpers/nodeMailer");

exports.AddAdmin = (req, res, next) => {
  const { User } = req.db.models;
  const superAdminId = req?.auth?.data?.userId;
  const { email: emailReq, fullName: fullNameReq } = req.body;
  const adminUserPassword = emailReq.split("@")[0];
  console.log("In Add");
  console.log(emailReq);
  console.log(fullNameReq);

  User.findOne({
    where: {
      email: emailReq,
    },
  })
    .then((admin) => {
      if (!admin) {
        console.log("Can create Admin new email");
        return bcrypt
          .hash(adminUserPassword, 12)
          .then(async (hashedPassword) => {
            // const token = await jwt.sign(
            //   {
            //     data: { email: req.body.email },
            //   },
            //   process.env.JWT_VERIFY_TOKEN,
            //   { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
            // );
            const user = new User({
              fullName: fullNameReq,
              email: emailReq,
              //role: req.body.role,
              password: hashedPassword,
              //verificationToken: token,
              role_id: 2,
            });

            await user.save();
            return adminUserPassword;
          })
          .then(async (result) => {
            let emailResponse = await sendMail({
              from: '"Fred Foo 👻" <foo@example.com>', // sender address
              to: req.body.email, // list of receivers
              subject: "Verify Email", // Subject line
              text: "Admin email", // plain text body
              html: `<b>Your Password is ${result}</b>`, // html body
            });
            return res.status(200).send({
              success: true,
              message: "Admin created succcessfully.",
              testURI: emailResponse.testURI,
            });
          });
      } else {
        return res
          .status(200)
          .send({ success: false, message: "Email Already exists" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).send({
        success: false,
        message: "ERROR",
        error,
      });
    });
};

exports.EditAdmin = async (req, res, next) => {
  console.log("in edit function ");
  try {
    const { User } = req.db.models;
    console.log(req.body);
    console.log("ID is ");
    console.log(req.params.id);
    const adminEditId = req?.params?.id;
    const { fullName: fullNameReq, phone_no: phone_noReq } = req.body;

    User.findOne({
      where: {
        id: adminEditId,
        //role_id: 2,
      },
    })
      .then(async (admin) => {
        if (admin?.role_id == 2) {
          await User.update(
            {
              //email: email ? email : user.email,
              fullName: fullNameReq ? fullNameReq : admin.fullName,
              phone_no: phone_noReq ? phone_noReq : admin.phone_no,
            },
            {
              where: {
                id: adminEditId,
              },
            }
          );

          User.findOne({
            where: {
              id: adminEditId,
            },
          })
            .then((updatedAdmin) => {
              console.log("Updated Admin is ");
              console.log(updatedAdmin);
              if (updatedAdmin) {
                return res.status(200).json({
                  message: `Admin Updated`,
                  success: true,
                  data: updatedAdmin,
                });
              } else {
                return res.status(200).send({
                  success: false,
                  message: "Canot update Admin Something went Wrong",
                });
              }
            })
            .catch((error) => {
              return res.status(400).send({
                success: false,
                message: error,
              });
            });
        } else if (admin?.role_id == 1) {
          res
            .status(200)
            .send({ success: false, message: "Cannot Edit super admin" });
        } else {
          res.status(200).send({
            success: false,
            message: "Cannot find the find the admin",
          });
        }
      })
      .catch((error) => {
        return res.status(400).send({
          success: false,
          message: error,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.DeleteAdmin = async (req, res, next) => {
  console.log("In delete Function");

  try {
    const adminDeleteId = req?.params?.id;
    const { User } = req.db.models;

    let admin = await User.findOne({
      where: {
        id: adminDeleteId,
      },
    });

    if (admin) {
      if (admin?.role_id == 2) {
        User.destroy({
          where: {
            id: adminDeleteId,
          },
        });

        return res
          .status(200)
          .send({ success: true, message: "Admin deleted successfully" });
      } else {
        return res.status(200).send({
          success: false,
          message: "Not authorized to delete this admin",
        });
      }
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Cannot find Admin" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.ViewAllAdmins = async (req, res, next) => {
  try {
    const { User } = req?.db?.models;

    let viewAdmins = await User.findAll({
      where: {
        role_id: 2,
      },
    });

    if (viewAdmins?.length) {
      console.log(viewAdmins);
      return res.status(200).json({
        success: true,
        message: "All Admins Found",
        admins: viewAdmins,
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Admins Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.ViewUsersAdmin = async (req, res, next) => {
  try {
    const { User } = req?.db?.models;

    let viewUsers = await User.findAll({
      where: {
        role_id: 3,
      },
    });

    if (viewUsers?.length) {
      console.log(viewUsers);
      return res.status(200).json({
        success: true,
        message: "All Users Found",
        users: viewUsers,
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Users Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.dashboardApis = async (req, res) => {
  try {
    const { User, Deal } = req.db.models;
    //const paramData = req.params.type;

    let session = Deal.findAndCountAll({
      where: {
        is_session_purchased: true,
      },
    });

    let video = Deal.findAndCountAll({
      where: {
        is_video_purchased: true,
      },
    });

    let combine = Deal.findAndCountAll({
      where: {
        is_session_purchased: true,
        is_video_purchased: true,
      },
    });

    let complete = Deal.findAndCountAll({
      where: {
        in_review: false,
      },
    });

    let draft = Deal.findAndCountAll({
      where: {
        in_review: 1,
      },
    });

    Promise.all([complete, draft, session, video, combine])
      .then((responses) => {
        // console.log("**********COMPLETE RESULTS****************");
        // console.log(responses[0]); // user profile
        // console.log(responses[1]); // all reports
        // console.log(responses[2]); // report details
        res.status(200).send({
          success: true,
          message: "Dahboard data is ",
          dashboard: responses,
        });
      })
      .catch((err) => {
        return res.status(400).send({
          success: false,
          message: err,
        });

        // console.log("**********ERROR RESULT****************");
        // console.log(err);
      });

    // console.log("data is ", data);

    // if (data?.count) {
    //   res.status(200).send({
    //     success: true,
    //     message: `All ${paramData} purchased deals are `,
    //     nodeals: data,
    //   });
    // } else {
    //   res.status(200).send({
    //     success: false,
    //     message: `Cannot find any ${paramData} purchased deals`,
    //   });
    // }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.numberUsers = async (req, res) => {
  try {
    const { User } = req.db.models;

    let data = await User.findAndCountAll({
      where: {
        role_id: 3,
      },
    });
    console.log(data?.count);
    if (data?.count) {
      res.status(200).send({
        success: true,
        messgae: "All Users are ",
        users: data,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Cannot find any users`,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.numberAdmins = async (req, res) => {
  try {
    const { User } = req.db.models;

    let data = await User.findAndCountAll({
      where: {
        role_id: 2,
      },
    });
    console.log(data?.count);
    if (data?.count) {
      res.status(200).send({
        success: true,
        messgae: "All Admins are ",
        users: data,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Cannot find any admins`,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.highlyPurchasedVideo = async (req, res) => {
  try {
    const { Deal, Video } = req.db.models;

    let video = await Deal.findAll({
      where: {
        is_video_purchased: 1,
      },
      attributes: [
        [
          sequelize.fn("max", sequelize.col("is_video_recommended")),
          "video_id",
        ],
      ],
      include: [{ model: Video }],
    });

    if (video) {
      res.status(200).send({
        success: true,
        message: "Highly Purchased video is ",
        video,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `Cannot find any video`,
      });
    }

    console.log("Video is ", video);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

// if (!validator.isEmail(req.body.email)) {
//   console.log("email: ", req.body.email);
//   return res.status(409).json({
//     message: `Email is Invalid`,
//     success: false,
//     code: 050,
//   });
