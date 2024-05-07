const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");
const sequelize = require("sequelize");

const { Op, or } = require("sequelize");

const sendMail = require("../../helpers/nodeMailer");
const e = require("express");
//const Question = require("../../models/Question");

exports.login = (req, res, next) => {
  try {
    const { User } = req.db.models;
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push("Please enter a valid email address.");
    if (validator.isEmpty(req.body.password))
      validationErrors.push("Password cannot be blank.");
    if (validationErrors.length) {
      return res
        .status(400)
        .send({ success: false, message: "Email and Password is required." });
    }
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then((user) => {
        if (user) {
          bcrypt
            .compare(req.body.password, user.password)
            .then(async (doMatch) => {
              if (doMatch) {
                // req.session.isLoggedIn = true;
                // req.session.user = .dataValues;
                // return req.session.save(err => {
                // 	console.log(err);
                // 	res.redirect('/');
                // });
                // if (!user.dataValues.isVerified) {
                //   return res.status(200).send({
                //     success: false,
                //     message:
                //       "Email veification is required, verify your email and try again.",
                //   });
                // }
                const token = await jwt.sign(
                  {
                    data: { userId: user.dataValues.id },
                  },
                  process.env.JWT_TOKEN_KEY,
                  { expiresIn: "1h" }
                );

                const refreshToken = await jwt.sign(
                  {
                    data: { userId: user.dataValues.id },
                  },
                  process.env.JWT_REFRESH_TOKEN_KEY,
                  { expiresIn: "7d" }
                );

                const { fullName, id, email, role_id } = user.dataValues;

                return res.status(200).send({
                  success: true,
                  message: "Login successfull here.",
                  token,
                  refreshToken,
                  user: { fullName, id, email, role_id },
                });
              } else {
                console.log("Not matched");
                return res.status(200).send({
                  success: false,
                  message: "Email or Password is incorrect.",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                success: false,
                message: "Sorry! Something went wrong.",
                err,
              });
            });
        } else {
          return res
            .status(200)
            .send({ success: false, message: "No user found with this email" });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500)({
          success: false,
          message: "Sorry! Something went wrong.",
          err,
        });
      });
  } catch (err) {
    return res
      .status(400)
      .send({ success: false, message: "Sorry! Something went wrong.", err });
  }
};

exports.logout = (req, res, next) => {
  if (res.locals.isAuthenticated) {
    req.session.destroy((err) => {
      return res.redirect("/");
    });
  } else {
    return res.redirect("/login");
  }
};

exports.signUp = (req, res, next) => {
  const { User } = req.db.models;

  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return bcrypt
          .hash(req.body.password, 12)
          .then(async (hashedPassword) => {
            const token = await jwt.sign(
              {
                data: { email: req.body.email },
              },
              process.env.JWT_VERIFY_TOKEN,
              { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
            );

            const user = new User({
              fullName: req.body.fullName,
              email: req.body.email,
              password: hashedPassword,
              verificationToken: token,
              role_id: 3,
            });
            return user.save();
          })
          .then(async (result) => {
            let emailResponse = await sendMail({
              from: '"Fred Foo 👻" <foo@example.com>', // sender address
              to: req.body.email, // list of receivers
              subject: "Verify Email", // Subject line
              text: "reset email", // plain text body
              html: `<b>Verify email at <a href=${process.env.VERIFY_URL}/api/auth/verify?verificationToken=${result.verificationToken}>Click Here to verify Email</a></b>`, // html body
            });
            return res.status(200).send({
              status: true,
              message: "User created succcessfully.",
              testURI: emailResponse.testURI,
            });
          });
      } else {
        return res.status(400).send({
          status: false,
          message: "E-Mail exists already, please pick a different one.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .send({ status: false, message: "Error creating user", err });
    });
};

exports.accountVerify = async (req, res, next) => {
  try {
    const { User } = req.db.models;

    const { verificationToken } = req.query;
    var decoded = await jwt.verify(
      verificationToken,
      process.env.JWT_VERIFY_TOKEN
    );
    User.findOne({
      where: {
        email: decoded.data.email,
      },
    })
      .then(async (user) => {
        if (user && user.verificationToken === verificationToken) {
          let result = await user.update({
            isVerified: true,
            verificationToken: null,
          });
          if (result) {
            res.redirect(process.env.VERIFY_RETURN_URL_SUCCESS);
          } else {
            res.redirect(process.env.VERIFY_RETURN_URL_FAIL);
          }
        } else {
          res.redirect(process.env.VERIFY_RETURN_URL_FAIL);

          // res.status(200).send({ message:"Invalid token",status:false })
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
};

exports.forgotPassword = async (req, res, next) => {
  const { User } = req.db.models;

  const validationErrors = [];
  console.log("email", req.body.email);
  try {
    if (!validator.isEmail(req?.body?.email))
      validationErrors.push("Please enter a valid email address.");

    if (validationErrors.length) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    User.findOne({
      where: {
        email: req?.body?.email,
      },
    })
      .then(async (user) => {
        if (user) {
          const token = await jwt.sign(
            {
              data: { email: req.body.email },
            },
            process.env.JWT_RESET_TOKEN,
            { expiresIn: `${process.env.VERIFY_TOKEN_EXPIRY}` }
          );
          console.log("HERE RESET TOKEN");
          user.resetToken = token;
          user.resetTokenExpiry = Date.now() + 3600000;
          const userSave = await user.save();
          if (!userSave) {
            return res
              .status(500)
              .send({ success: false, message: "Something went wrong" });
          }
          let emailResponse = await sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: req.body.email, // list of receivers
            subject: "Reset password Email", // Subject line
            text: "reset email", // plain text body
            html: `<b>Verify email at <a href=${process.env.REACT_URL}/resetpassword?verificationToken=${token}>Click Here to reset Password</a></b>`, // html body
          });
          res.status(200).send({
            message: "A link has been sent to your registered email. ",
            success: !!user,
            testURI: emailResponse.testURI,
          });
        } else {
          res.status(200).send({
            message: "Email is incorrect",
            success: !!user,
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
      .send({ success: false, message: "Something went wrong", err });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { User } = req.db.models;
    const { verificationToken, password } = req.body;
    console.log("Params are");
    //const verificationToken = req.query.verificationToken;
    console.log(verificationToken);
    console.log(password);
    //const password = "wahab";

    var decoded = await jwt.verify(
      verificationToken,
      process.env.JWT_RESET_TOKEN
    );
    User.findOne({
      where: {
        email: decoded.data.email,
      },
    })
      .then(async (user) => {
        if (user && user.resetToken === verificationToken) {
          return bcrypt.hash(password, 12).then(async (hashedPassword) => {
            let result = await user.update({
              password: hashedPassword,
              resetToken: null,
              resetTokenExpiry: null,
            });
            if (result) {
              res
                .status(200)
                .send({ message: "Password updated", success: true });
            } else {
              res.status(200).send({
                message: "Err updating password try again",
                success: false,
              });
            }
          });
        } else {
          // res.redirect(process.env.VERIFY_RETURN_URL_FAIL)

          res.status(200).send({ message: "Invalid token", success: false });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ success: false, message: "Something went wrong", err });
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const { User, Role } = req.db.models;
    const userId = req?.auth?.data?.userId;
    User.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: Role,
          required: false,
        },
      ],
    })
      .then(async (user) => {
        if (user) {
          // res.redirect(process.env.VERIFY_RETURN_URL_FAIL)
          const { fullName, id, email } = user;

          res.status(200).send({
            status: true,
            user: { fullName, id, email, role: user.Role },
          });
        } else {
          res
            .status(200)
            .send({ status: false, user: null, message: "User not found" });
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
};

exports.createQuestions = async (req, res) => {
  try {
    const { User, Question, Category } = req.db.models;
    const createdBy = req?.auth?.data?.userId;
    //const category_id = req?.params?.category_id;
    const {
      statement: adminQuestion,
      metadata,
      category_id,
      sequence,
    } = req.body;
    let user = await User.findOne({
      where: {
        id: createdBy,
      },
    });
    if (user) {
      let findCategory = await Category.findOne({
        where: {
          id: category_id,
        },
      });
      if (findCategory) {
        let question = await Question.findOne({
          where: {
            statement: sequelize.where(
              sequelize.fn("LOWER", sequelize.col("statement")),
              "LIKE",
              adminQuestion.toLowerCase()
            ),
          },
        });
        console.log("Afrer search question");
        //console.log(question);
        if (!question) {
          const question = new Question({
            statement: adminQuestion,
            metadata,
            sequence,
            category_id,
          }).save();

          return res.status(200).json({
            message: "The question have been saved",
            success: true,
            statement: question,
          });
        } else {
          return res.status(200).json({
            message: "This question already exists",
            success: false,
            code: 001,
          });
        }
      } else {
        return res.status(404).json({
          message: "Category doesn't exist",
          success: false,
          code: 001,
        });
      }
    } else {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
        code: 002,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 003,
    });
  }
};

exports.updateQuestions = async (req, res) => {
  try {
    const { User, Question } = req.db.models;
    const createdBy = req?.auth?.data?.userId;
    const questionId = req?.params?.question_id;
    let { statement, metadata, category_id, sequence } = req.body;

    let user = await User.findOne({
      where: {
        id: createdBy,
      },
    });

    if (user) {
      let question = await Question.findOne({
        where: {
          id: questionId,
        },
      });

      if (question) {
        await Question.update(
          {
            statement: statement ? statement : question.statement,
            metadata: metadata ? metadata : question.metadata,
            category_id: category_id ? category_id : question.category_id,
            sequence: sequence ? sequence : question.sequence,
          },
          {
            where: {
              id: questionId,
            },
          }
        );

        let updated = await Question.findOne({
          where: {
            id: questionId,
          },
        });

        if (updated) {
          return res.status(200).json({
            message: `The question have been updated`,
            success: true,
            data: updated,
          });
        }
      } else {
        return res.status(404).json({
          message: "Question id Not Found",
          success: false,
          code: 011,
        });
      }
    } else {
      return res.status(404).json({
        message: "User id Not Found",
        success: false,
        code: 012,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 013,
    });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { User, Question, Category } = req.db.models;
    const createdBy = req?.auth?.data?.userId;
    //const questionId = req?.params?.question_id;
    const cId = req?.params?.catId;
    console.log("Cat id is ", cId);
    let question;
    let user = await User.findOne({
      where: {
        id: createdBy,
      },
    });
    if (user) {
      if (cId > 0) {
        question = await Question.findAll({
          where: {
            category_id: cId,
          },
          include: [
            {
              model: Category,
              attributes: ["name"],
              where: {
                is_delete: false,
              },
            },
          ],
          order: [["sequence", "ASC"]],
        });
      } else if (cId == "all") {
        question = await Question.findAll({
          include: [
            {
              model: Category,
              attributes: ["name"],
              where: {
                is_delete: false,
              },
            },
          ],
          order: [["sequence", "ASC"]],
        });
      } else {
        res.status(200).send({
          success: false,
          message: "Category params are Invalid",
        });
      }
      if (question.length) {
        return res.status(200).json({
          Question_data: question,
          success: true,
        });
      } else {
        return res.status(200).json({
          message: "Questions Not Found of given category",
          success: false,
          code: 020,
        });
      }
    } else {
      return res.status(404).json({
        message: "User id Not Found",
        success: false,
        code: 021,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.deleteQuestions = async (req, res) => {
  try {
    const { User, Question } = req.db.models;
    const createdBy = req?.auth?.data?.userId;
    const questionId = req?.params?.question_id;

    let user = await User.findOne({
      where: {
        id: createdBy,
      },
    });
    if (user) {
      let delQuestion = await Question.findOne({
        where: {
          id: questionId,
        },
      });
      if (delQuestion) {
        await Question.destroy({
          where: {
            id: questionId,
          },
        });

        return res.status(200).json({
          message: "The Question has been deleted",
          success: true,
        });
      } else {
        return res.status(404).json({
          message: "Question id Not Found",
          success: false,
          code: 031,
        });
      }
    } else {
      return res.status(404).json({
        message: "User id Not Found",
        success: false,
        code: 032,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 033,
    });
  }
};

exports.appleSignIn = async (req, res) => {
  try {
    const { User } = req.db.models;
    let { email, appleID } = req.body;
    let Obj = {};

    let checkUser = await User.findOne({
      where: {
        appleID,
      },
    });

    console.log("User", checkUser);
    if (checkUser) {
      const { id } = checkUser.dataValues;

      const token = jwt.sign(
        {
          data: { userId: checkUser.dataValues.id },
        },
        process.env.JWT_TOKEN_KEY,
        { expiresIn: "60d" }
      );
      const refreshToken = await jwt.sign(
        { id },
        process.env.JWT_REFRESH_TOKEN_KEY,
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "User Logged In",
        success: true,
        token: token,
        refreshToken: refreshToken,
        data: checkUser,
      });
    } else {
      let user = await new User({
        appleID,
        email: email ? email : `${appleID}@email.com`,
        role_id: "3",
      }).save();

      // console.log(newUser)
      console.log("newUser", user);

      //const id = newUser.id;

      const { id } = user.dataValues;

      const token = jwt.sign(
        {
          data: { userId: user.dataValues.id },
        },
        process.env.JWT_TOKEN_KEY,
        { expiresIn: "60d" }
      );
      const refreshToken = await jwt.sign(
        { id },
        process.env.JWT_REFRESH_TOKEN_KEY,
        {
          expiresIn: "7d",
        }
      );
      // const id = user.dataValues;
      let checkUser = await User.findOne({
        where: {
          appleID,
        },
      });
      return res.status(200).json({
        message: "User has been created, token expires in 7days",

        success: true,
        token: token,
        refreshToken: refreshToken,
        data: checkUser,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 043,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log("req.auth: ", req.auth);
    const { User } = req.db.models;
    let userId = req?.auth?.data?.userId;
    let { email, fullName, phone_no, img, company } = req.body;

    // if (!validator.isEmail(req.body.email)) {
    //   console.log("email: ", req.body.email);
    //   return res.status(409).json({
    //     message: `Email is Invalid`,
    //     success: false,
    //     code: 050,
    //   });
    // }
    // if (!validator.isInt(req.body.phone, { min: 10, max: 10 })) {
    //   return res.status(409).json({
    //     message: `Phone number is Invalid`,
    //     success: false,
    //     code: 051,
    //   });}
    // else {
    console.log("req.body", req.body);

    console.log("userIDDDDDDDDDDD: ", userId);

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    console.log("userfffffff:    ", user);

    if (user) {
      let checkEmail;
      if (email) {
        checkEmail = await User.findOne({
          where: {
            email,
          },
        });
      }
      if (!checkEmail) {
        await User.update(
          {
            fullName: fullName ? fullName : user.fullName,
            phone_no: phone_no ? phone_no : user.phone_no,
            email: email ? email : user.email,
            img: img ? img : null,
            company: company ? company : user.company,
          },
          {
            where: {
              id: userId,
            },
          }
        );

        let updateUser = await User.findOne({
          where: {
            id: userId,
          },
        });

        console.log("updateUser:   ", updateUser);

        if (updateUser) {
          return res.status(200).json({
            message: `User Updated`,
            success: true,
            data: updateUser,
          });
        }
      } else {
        return res.status(200).json({
          message: `Email already exists`,
          success: false,
        });
      }
    } else {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
        code: 501,
      });
    }
    // }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 052,
    });
  }
};

exports.justImg = async (req, res) => {
  let file = req.file;
  console.log(file);
  try {
    if (!file) {
      return res.status(400).json({
        message: `Invalid param: field empty`,
        success: false,
        code: 060,
      });
    } else {
      return res.status(200).json({
        url: "public/src/image/" + req.file.filename,
        message: `Img has been uploaded`,
        success: true,
      });
    }
  } catch (err) {
    return res.status(503).json({
      message: `${err}`,
      success: false,
      code: 061,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { User } = req.db.models;
    const userId = req?.auth?.data?.userId;

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      return res.status(200).json({
        message: "User data",
        success: true,
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "User Data Not Found",
        success: false,
        code: 071,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `Try/catch err: ${err}`,
      success: false,
      code: 072,
    });
  }
};

exports.delUsers = async (req, res) => {
  try {
    const { User, Deal, Shared_Deals } = req.db.models;
    const userId = req?.auth?.data?.userId;

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      await Deal.destroy({
        where: {
          deal_created_by: userId,
        },
      });

      await Shared_Deals.destroy({
        where: {
          [Op.or]: [{ userId }, { createdBy: userId }],
        },
      });

      await User.destroy({
        where: {
          id: userId,
        },
      });

      return res.status(200).json({
        message: `The User has been deleted`,
        success: true,
      });
    } else {
      return res.status(404).json({
        message: `User Id Not Found`,
        success: false,
        code: 081,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 082,
    });
  }
};

exports.postSubscription = async (req, res) => {
  try {
    const { Subscription } = req.db.models;
    const userId = req?.auth?.data?.userId;
    const { status, duration, metadata } = req.body;
    var startdate = new Date();
    var enddate = new Date();
    enddate.setDate(startdate.getDate() + 30);

    console.log("Status is ", status);
    console.log("Duration is ", duration);
    // let enddate = newDate.toISOString();
    // let startdate = today.toISOString();

    if (status == true) {
      const data = await Subscription.create({
        duration,
        startdate,
        enddate,
        metadata,
        status,
        userId,
      });

      if (data) {
        res.status(200).send({
          message: "Subscription record created",
          success: true,
          subscription: data,
        });
      } else {
        res.status(200).send({
          message: "Cannot create subscription record",
          success: false,
        });
      }
    } else {
      res.status(200).send({
        message: "Subscription status is false",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 082,
    });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { Subscription } = req.db.models;
    const userId = req?.auth?.data?.userId;

    let data = await Subscription.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length) {
      let today = new Date();
      console.log("Today date is ", today);
      console.log("End date of subscription is ", data[0].startdate);

      let day = today - data[0]?.startdate;
      day = day / 86400000;
      console.log("Day are ", day);
      if (day < 30) {
        res.status(200).send({
          message: "User subscription is not ended",
          success: true,
          subscriptionended: false,
          subscription: data,
        });
      } else {
        res.status(200).send({
          message: "User subscription is ended",
          success: false,
          subscriptionended: true,
          subscription: data,
        });
      }
    } else {
      res.status(200).send({
        message: "Subscription record not found",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 082,
    });
  }
};

// exports.imgDel = async (req, res) =>{
//   let values = req.body;
//   console.log(values);
//   try {
//     if (!values) {
//       return res.status(422).json({
//         message: `Invalid params or empty field`,
//         success: false,
//         code: 091,
//       });
//     } else {
//       // delete file named 'values'

//       fs.unlinkSync(values.img, function (err) {
//         if (err) throw err;
//         // if no error, file has been deleted successfully
//       });

//       res.status(200).json({
//         message: "File deleted",
//         success: true,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(503).json({
//       message: `try/catch: ${err}`,
//       success: false,
//       code: 092,
//     });
//   }
// }
