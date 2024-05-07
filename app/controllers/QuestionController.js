const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const validator = require("validator");

const { Op, or } = require("sequelize");

exports.createQuestions = async (req, res) => {
  try {
    const { User, Question } = req.db.models;
    const createdBy = req?.auth?.data?.userId;
    const categoryId = req?.params?.category_id;
    const { statement, metadata } = req.body;
    let user = await User.findOne({
      where: {
        id: createdBy,
      },
    });
    if (user) {
      let question = await Question.findOne({
        where: {
          id: categoryId,
        },
      });
      if (question) {
        const question = new Question({
          statement,
          metadata,
        }).save();

        return res.status(200).json({
          message: "The response have been saved",
          success: true,
          statement: question,
        });
      } else {
        return res.status(404).json({
          message: "Question Not Found",
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

// exports.updateQuestions = async (req, res) => {
//   try {
//     const { User, Question } = req.db.models;
//     const createdBy = req?.auth?.data?.userId;
//     const questionId = req?.params?.question_id;
//     let { statement, metadata } = req.body;

//     let user = await User.findOne({
//       where: {
//         id: createdBy,
//       }

//     });

//     if (user) {
//       let question = await Question.findOne({
//         where: {
//           id: questionId,
//         }
//       });

//       if (question) {
//         await Question.updateOne(
//           {
//             statement: statement ? statement : question.statement,
//             metadata: metadata ? metadata : question.metadata,
//           },
//           {
//             where: {
//               id: questionId,
//             },
//           }
//         );

//         let updated = await Question.findOne({
//           where: {
//             id: categoryId,
//           }
//         });

//         if (updated) {
//           return res.status(200).json({
//             message: `The question have been updated`,
//             success: true,
//             data: updated,
//           });
//         }
//       } else {
//         return res.status(404).json({
//           message: "Question id Not Found",
//           success: false,
//           code: 011,
//         });
//       }
//     } else {
//       return res.status(404).json({
//         message: "User id Not Found",
//         success: false,
//         code: 012,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 013,
//     });
//   }
// };

exports.getQuestions = async (req, res) => {
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
      let question = await Question.findOne({
        where: {
          id: questionId,
        },
      });
      if (question) {
        return res.status(200).json({
          Question_data: question,
          success: true,
        });
      } else {
        return res.status(404).json({
          message: "Question id Not Found",
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

exports.saveQuestionResponse = async (req, res) => {
  try {
    console.log("question response saving");
    const { QuestionResponse, Deal, Question } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId, data } = req?.body;
    const dealExist = await Deal.getById(dealId);
    if (!dealExist) {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
    let responseSaved = [];
    let responsePromise = [];
    data.map(async (obj) => {
      const { questionId, response } = obj;
      const questionExist = await Question.findOne({
        where: { id: questionId },
      });

      if (questionExist) {
        const responseExist = await QuestionResponse.findOne({
          where: { question_id: questionId, deal_id: dealId },
        });
        if (responseExist) {
          const responseUpdated = await responseExist.update({ response });

          if (responseUpdated) {
            console.log("updated question", questionId);
            let obj = { questionId, status: true };
            console.log(obj);
            responseSaved.push(obj);
          } else {
            let obj = { questionId, status: false };
            responseSaved.push(obj);
          }
          if (responseSaved.length === data.length) {
            console.log("send response now");
            return res.status(200).send({ status: true, data: responseSaved });
          }

          responsePromise.push(responseUpdated);
        } else {
          const savedResponse = await new QuestionResponse({
            response,
            question_id: questionId,
            deal_id: dealId,
          }).save();
          let obj = { questionId, status: true };
          responseSaved.push(obj);
          responsePromise.push(savedResponse);
          if (responseSaved.length === data.length) {
            console.log("send response now");
            return res.status(200).send({ status: true, data: responseSaved });
          }
        }
      } else {
        let obj = { questionId, status: false };
        responseSaved.push(obj);
        if (responseSaved.length === data.length) {
          console.log("send response now");
          return res.status(200).send({ status: true, data: responseSaved });
        }
      }
    });
    Promise.all(responsePromise).then((data) => {
      console.log("all promissed resolved", responseSaved);
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
