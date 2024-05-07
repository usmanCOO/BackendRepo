var jwt = require("jsonwebtoken");
const validator = require("validator");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

exports.createDeals = async (req, res) => {
  try {
    const { User, Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    let { deal_name, investment_size, status, closed_date } = req.body;

    let deal = await new Deal({
      deal_name,
      investment_size,
      status,
      closed_date,
      deal_created_by: userId,
    }).save();

    let firstDealCheck = deal ? true : false;
    console.log("firstDealCheck ", firstDealCheck);

    const [user, created] = await User.upsert(
      { id: userId, isdealcreated: firstDealCheck }, // Values to insert or update
      { returning: true } // Options
    );

    console.log("Upsert updated the isdealcreated or not ", created);

    return res.status(200).json({
      message: `Deal has been created`,
      success: true,
      data: deal,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 103,
    });
  }
};

exports.checkUserFirstDeal = async (req, res) => {
  try {
    const { User, Deal } = req.db.models;
    const { userId } = req?.auth?.data;

    let isUserFirstDeal = await User.findOne({
      where: {
        id: userId,
      },
    });

    console.log("User is ", isUserFirstDeal);

    if (isUserFirstDeal) {
      if (!isUserFirstDeal.isdealcreated) {
        res.status(200).send({
          success: true,
          message: "It is user's first deal and is free",
        });
      } else {
        res.status(200).send({
          success: false,
          message: "It is not user's first deal and is not free",
        });
      }
    } else {
      res.status(200).send({
        success: false,
        message: "User not found",
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

exports.updateCalendlyDealData = async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const dealId = req?.params?.id;
    let { session_url, metadata } = req.body;

    let deal = await Deal.findOne({
      where: {
        id: dealId,
      },
    });
    if (deal) {
      let updateVideo = await Deal.update(
        {
          session_url: session_url ? session_url : deal.session_url,
          metadata: metadata ? metadata : deal.metadata,
        },
        {
          where: {
            id: dealId,
          },
        }
      );
      let updated = await Deal.findOne({
        where: {
          id: dealId,
        },
      });

      if (updated) {
        return res.status(200).json({
          message: `Calendly session url and metadata updated`,
          success: true,
          data: updated,
        });
      }
    } else {
      return res.status(404).json({
        message: "Deal id Not Found",
        success: false,
        code: 111,
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
};

// exports.updateCalendlyDealData = async (req, res) => {
//   try {
//     const { User, Deal } = req.db.models;
//     const dealCreatedBy = req?.auth?.data?.userId;
//     const dealId = req?.params?.id;
//     let { session_url, metadata } = req.body;

//     let user = await User.findOne({
//       where: {
//         id: dealCreatedBy,
//       },
//     });
//     if (user) {
//       let deal = await Deal.findOne({
//         where: {
//           id: dealId,
//         },
//       });
//       if (deal) {
//         let updateVideo = await Deal.update(
//           {
//             session_url: session_url ? session_url : deal.session_url,
//             metadata: metadata ? metadata : deal.metadata,
//           },
//           {
//             where: {
//               id: dealId,
//             },
//           }
//         );
//         let updated = await Deal.findOne({
//           where: {
//             id: dealId,
//           },
//         });

//         if (updated) {
//           return res.status(200).json({
//             message: `Calendly session url and metadata updated`,
//             success: true,
//             data: updated,
//           });
//         }
//       } else {
//         return res.status(404).json({
//           message: "Deal id Not Found",
//           success: false,
//           code: 111,
//         });
//       }
//     } else {
//       return res.status(404).json({
//         message: "User id Not Found",
//         success: false,
//         code: 112,
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
// };

exports.updateDeals = async (req, res) => {
  try {
    const { User, Deal } = req.db.models;
    const dealCreatedBy = req?.auth?.data?.userId;
    const dealId = req?.params?.dealid;
    let {
      deal_name,
      is_draft,
      session_url,
      session_start_date,
      is_video_purchased,
      is_session_purchased,
      investment_size,
      closed_date,
      color,
    } = req.body;

    let user = await User.findOne({
      where: {
        id: dealCreatedBy,
      },
    });
    if (user) {
      let deal = await Deal.findOne({
        where: {
          id: dealId,
        },
      });
      if (deal) {
        let updateVideo = await Deal.update(
          {
            deal_name: deal_name ? deal_name : deal.deal_name,
            is_draft: is_draft ? is_draft : deal.is_draft,
            session_url: session_url ? session_url : deal.session_url,
            session_start_date: session_start_date
              ? session_start_date
              : deal.session_start_date,
            is_video_purchased: is_video_purchased
              ? is_video_purchased
              : deal.is_video_purchased,
            is_session_purchased: is_session_purchased
              ? is_session_purchased
              : deal.is_session_purchased,
            investment_size: investment_size
              ? investment_size
              : deal.investment_size,
            closed_date: closed_date ? closed_date : deal.closed_date,
            color: color ? color : deal.color,
          },
          {
            where: {
              id: dealId,
            },
          }
        );
        let updated = await Deal.findOne({
          where: {
            id: dealId,
          },
        });

        if (updated) {
          return res.status(200).json({
            message: `The Deal have been updated`,
            success: true,
            data: updated,
          });
        }
      } else {
        return res.status(404).json({
          message: "Deal id Not Found",
          success: false,
          code: 111,
        });
      }
    } else {
      return res.status(404).json({
        message: "User id Not Found",
        success: false,
        code: 112,
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
};

exports.getDeals = async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId } = req?.params;
    let query_obj = {};
    if (!isNaN(dealId)) {
      query_obj = {
        where: {
          id: dealId,
          deal_created_by: userId,
        },
        order: [["createdAt", "DESC"]],
      };
    } else {
      query_obj = {
        order: [["createdAt", "DESC"]],
      };
    }
    console.log("query_obj", query_obj);
    let deal = await Deal.findAll(query_obj);
    if (deal && deal.length) {
      return res.status(200).json({
        deal_data: deal,
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "Deal id Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.userDeals = async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    let filter = req.params.filter;
    let query_obj = {};
    let deal;

    // let deal = await Deal.findAll({
    //   where: {
    //     deal_created_by: userId,
    //     color: ["#00FF00", "#90EE90", "#FFFF00", "#FFA500", "#FF0000"],
    //   },
    // });
    if (filter == "color") {
      const hexArray = ["#00FF00", "#90EE90", "#FFFF00", "#FFA500", "#FF0000"];
      deal = await Deal.findAll({
        where: {
          deal_created_by: userId,
        },
        order: [[sequelize.fn("FIELD", sequelize.col("color"), ...hexArray)]],
      });
    } else if (filter == "deal_name") {
      deal = await Deal.findAll({
        where: { deal_created_by: userId },
        order: [["deal_name", "ASC"]],
      });
    } else if (filter == "closed_date") {
      deal = await Deal.findAll({
        where: { deal_created_by: userId },
        order: [["closed_date", "DESC"]],
      });
    } else if (filter == "investment_size") {
      deal = await Deal.findAll({
        where: { deal_created_by: userId },
        order: [["investment_size", "DESC"]],
      });
    } else if (filter == "updated_date") {
      deal = await Deal.findAll({
        where: { deal_created_by: userId },
        order: [["updatedAt", "DESC"]],
      });
    } else {
      deal = await Deal.findAll({
        where: {
          deal_created_by: userId,
        },
      });
    }

    if (deal.length > 0) {
      return res.status(200).send({
        message: "your deals are",
        deal,
        success: true,
      });
    } else {
      return res.status(200).send({
        message: "no deal found",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.sharedDealPage = async (req, res) => {
  try {
    const { Deal, Shared_Deals } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId } = req?.params;
    const { isShared } = req.body;
    console.log("Is Shared is ****************** ", isShared);
    let query_obj = {};
    let shared_deal;
    console.log("Deal Id is ", dealId);
    if (!isNaN(dealId)) {
      if (isShared == "true") {
        shared_deal = await Shared_Deals.findOne({
          where: {
            dealId,
            userId,
          },
        });
      }
      if (shared_deal) {
        query_obj = {
          where: {
            id: dealId,
          },
        };
      } else {
        query_obj = {
          where: {
            id: dealId,
            deal_created_by: userId,
          },
        };
      }
    } else {
      query_obj = {
        order: [["createdAt", "DESC"]],
      };
    }
    console.log("query_obj", query_obj);
    let deal = await Deal.findAll(query_obj);
    if (deal && deal.length) {
      return res.status(200).json({
        deal_data: deal,
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "Deal id Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.delDeals = async (req, res) => {
  try {
    const { User, Deal, Shared_Deals, Notification } = req.db.models;
    const dealCreatedBy = req?.auth?.data?.userId;
    const dealId = req?.params?.dealId;

    let user = await User.findOne({
      where: {
        id: dealCreatedBy,
      },
    });
    if (user) {
      let delDeal = await Deal.findOne({
        where: {
          id: dealId,
        },
      });
      if (delDeal) {
        await Shared_Deals.destroy({
          where: {
            dealId,
          },
        });

        //delete notification here
        await Notification.destroy({
          where: {
            deal_Id: dealId,
          },
        });

        await Deal.destroy({
          where: {
            id: dealId,
          },
        });

        return res.status(200).json({
          message: "The Deal has been deleted",
          success: true,
        });
      } else {
        return res.status(404).json({
          message: "Deal id Not Found",
          success: false,
          code: 131,
        });
      }
    } else {
      return res.status(404).json({
        message: "User id Not Found",
        success: false,
        code: 132,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 133,
    });
  }
};

exports.saveDeal = async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId } = req?.body;
    const dealExist = await Deal.getById(dealId);
    if (dealExist) {
      const dealUpdated = await dealExist.update({ is_draft: false });
      return res.status(200).send({ status: true, data: dealUpdated });
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.submitDealForReview = async (req, res) => {
  try {
    const { Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId, color } = req?.body;
    const dealExist = await Deal.getById(dealId);
    if (dealExist) {
      const dealUpdated = await dealExist.update({
        color,
        in_review: true,
        is_draft: false,
      });
      return res.status(200).send({ status: true, data: dealUpdated });
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.shareDealWithUser = async (req, res) => {
  try {
    const { Deal, Shared_Deals, User } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId, email, message } = req?.body;
    if (!dealId) {
      throw new Error("Deal Id is requried");
    }
    if (!email) {
      throw new Error("User emial is required");
    }
    const dealExist = await Deal.getById(dealId);
    const userExist = await User.findOne({ where: { email } });
    if (!userExist) {
      console.log("User not found");
      return res.status(200).send({ status: false, msg: "User not found" });
    }
    if (dealExist) {
      const dealShared = await new Shared_Deals({
        dealId: dealId,
        userId: userExist.id,
        createdBy: userId,
        description: message,
      }).save();
      return res.status(200).send({ status: true, data: dealShared });
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

//deals_shared
exports.getShareDealWithUser = async (req, res) => {
  try {
    console.log("I am here");
    const { Deal, Shared_Deals, User, Notification } = req.db.models;
    const { userId } = req?.auth?.data;
    let filter = req.params.filter;
    let dealExist;
    console.log("userID is ", userId);
    const dealIncludes = [
      {
        model: Deal,
        attributes: [
          "id",
          "deal_name",
          "color",
          "investment_size",
          "closed_date",
          "updatedAt",
        ],
      },
      {
        model: User,
        as: "shared_user",
        attributes: ["id", "fullName", "phone_no", "email", "profilePhoto"],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "fullName", "phone_no", "email", "profilePhoto"],
      },
    ];
    if (filter == "size") {
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [
          ...dealIncludes,
          {
            model: Deal,
            attributes: [],
            where: {
              investment_size: { [Op.gt]: 0 },
            },
          },
        ],
        order: [[{ model: Deal, as: "Deal" }, "investment_size", "DESC"]],
      });
    } else if (filter == "color") {
      const hexArray = ["#00FF00", "#90EE90", "#FFFF00", "#FFA500", "#FF0000"];
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [
          ...dealIncludes,
          {
            model: Deal,
            attributes: [],
          },
        ],
        order: [[sequelize.fn("FIELD", sequelize.col("color"), ...hexArray)]],
      });
    } else if (filter == "deal_name") {
      console.log("In deal name");
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "deal_name", "ASC"]],
      });
    } else if (filter == "person_name") {
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [...dealIncludes],
        order: [[{ model: User, as: "User" }, "fullName", "ASC"]],
      });
    } else if (filter == "closed_date") {
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "closed_date", "DESC"]],
      });
    } else if (filter == "updated_date") {
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "updatedAt", "DESC"]],
      });
    } else {
      dealExist = await Shared_Deals.findAll({
        where: { userId, isDeleted: false },
        include: [...dealIncludes],
      });
    }
    //console.log("dealExist", dealExist);
    if (dealExist) {
      let notification = await Notification.findAll({
        where: {
          send_to: userId,
          read_status: false,
        },
        attributes: [
          "deal_Id",
          [sequelize.fn("COUNT", sequelize.col("deal_Id")), "count"],
        ],
        group: ["deal_Id"],
      });

      let newData = dealExist.map((obj) => {
        console.log("Object is ", obj);
        let find = notification.find(
          (not) => not.dataValues.deal_Id == obj.dataValues.dealId
        );
        if (find) {
          obj.dataValues.unread = find.dataValues.count;
        } else {
          obj.dataValues.unread = 0;
        }
        return obj;
      });

      return res.status(200).send({ success: true, data: newData });
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
exports.deleteShareDealWithUser = async (req, res) => {
  try {
    const { Deal, Shared_Deals, User } = req.db.models;
    const { userId } = req?.auth?.data;
    const id = req.params.dealId;
    console.log(`Deal ${id},user ${userId}`);
    const dealExist = await Shared_Deals.findOne({
      where: { userId, dealId: id },
    });

    // console.log("dealExist", dealExist);
    if (dealExist) {
      let updateDeal = await dealExist.update(
        {
          isDeleted: true,
        },
        {
          userId,
          dealId: id,
        }
      );

      console.log("UpdateDeal is ", updateDeal);
      if (updateDeal) {
        return res.status(200).send({ success: true, data: dealExist });
      } else {
        return res.status(200).json({
          message: "Cannot delete deal",
          success: false,
          code: 121,
        });
      }
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
exports.updateDealStatus = async (req, res) => {
  try {
    const { Shared_Deals, Deal } = req.db.models;
    const { userId } = req?.auth?.data;
    const { dealId, status, closed_date } = req?.body;
    if (!dealId) {
      throw new Error("Deal Id is requried");
    }
    if (!status) {
      throw new Error("Status is required");
    }
    // const dealExist = await Shared_Deals.findOne({where:{dealId}});
    const deal_Exist = await Deal.findOne({ where: { id: dealId } });
    if (deal_Exist) {
      await deal_Exist.update({ status, closed_date });
      //  if(dealExist){
      // dealExist.update({status})
      return res.status(200).send({ status: true, data: deal_Exist });

      // }
      // else
      // {
      // return res.status(200).json({
      // message: "Deal Not Found in shared deal",
      // success: false,
      // code: 121,
      // });
      // }
    } else {
      return res.status(200).json({
        message: "Deal Not Found in deal",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
exports.dealAnalysis = async (req, res, next) => {
  try {
    const { Deal, User, Video, Payment_logs } = req.db.models;
    const { userId } = req?.auth?.data;
    //const { dealId } = req?.params;
    //let query_obj = {};

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      console.log(user);
      let deals = await Deal.findAll({
        where: {
          is_draft: false,
        },

        include: [
          {
            model: User,
            required: true,
          },
        ],
      });

      if (deals) {
        return res.status(200).json({
          message: "deal analysis is ",
          success: true,
          dealAnalysis: deals,
        });
      } else {
        return res.status(200).json({
          message: "no deals found",
          success: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "User Not Found",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.getMyShareDeals = async (req, res) => {
  try {
    //createdBy: userId
    const { Deal, Shared_Deals, User, Notification } = req.db.models;
    const { userId } = req?.auth?.data;
    console.log("userId sasad", userId);
    let filter = req.params.filter;
    let dealExist;
    const dealIncludes = [
      {
        model: Deal,
        attributes: [
          "id",
          "deal_name",
          "color",
          "investment_size",
          "closed_date",
          "updatedAt",
        ],
      },
      {
        model: User,
        as: "shared_user",
        attributes: ["id", "fullName", "phone_no", "email", "profilePhoto"],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "fullName", "phone_no", "email", "profilePhoto"],
      },
    ];

    if (filter == "size") {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [
          ...dealIncludes,
          {
            model: Deal,
            attributes: [],
            where: {
              investment_size: { [Op.gt]: 0 },
            },
          },
        ],
        order: [[{ model: Deal, as: "Deal" }, "investment_size", "DESC"]],
      });
    } else if (filter == "deal_name") {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "deal_name", "ASC"]],
      });
    } else if (filter == "color") {
      const hexArray = ["#00FF00", "#90EE90", "#FFFF00", "#FFA500", "#FF0000"];
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [
          ...dealIncludes,
          {
            model: Deal,
            attributes: [],
          },
        ],
        order: [[sequelize.fn("FIELD", sequelize.col("color"), ...hexArray)]],
      });
    } else if (filter == "person_name") {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [...dealIncludes],
        order: [[{ model: User, as: "shared_user" }, "fullName", "ASC"]],
      });
    } else if (filter == "closed_date") {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "closed_date", "DESC"]],
      });
    } else if (filter == "updated_date") {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [...dealIncludes],
        order: [[{ model: Deal, as: "Deal" }, "updatedAt", "DESC"]],
      });
    } else {
      dealExist = await Shared_Deals.findAll({
        where: { createdBy: userId },
        include: [...dealIncludes],
      });
    }

    console.log("dealExist", dealExist);
    if (dealExist) {
      let notification = await Notification.findAll({
        where: {
          send_to: userId,
          read_status: false,
        },
        attributes: [
          "deal_Id",
          [sequelize.fn("COUNT", sequelize.col("deal_Id")), "count"],
        ],
        group: ["deal_Id"],
      });

      let newData = dealExist.map((obj) => {
        console.log("Object is ", obj);
        let find = notification.find(
          (not) => not.dataValues.deal_Id == obj.dataValues.dealId
        );
        if (find) {
          obj.dataValues.unread = find.dataValues.count;
        } else {
          obj.dataValues.unread = 0;
        }
        return obj;
      });
      return res.status(200).send({ status: true, data: dealExist });
    } else {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.deleteMyShareDeal = async (req, res) => {
  try {
    const { Deal, Shared_Deals, Notification } = req.db.models;
    const { userId } = req?.auth?.data;
    //const { }
    const { dealId, shareduser } = req.params;

    console.log(
      `created by ${userId}, shareduser ${shareduser}, dealId ${dealId}`
    );

    let ShareDeal = await Shared_Deals.findAll({
      where: {
        createdBy: userId,
        dealId,
        userId: shareduser,
      },
    });

    if (ShareDeal.length) {
      let findNotification = await Notification.findAll({
        where: {
          send_to: shareduser,
          deal_Id: dealId,
        },
      });

      if (findNotification.length) {
        let delNotification = await Notification.destroy({
          where: {
            send_to: shareduser,
            deal_Id: dealId,
          },
        });

        console.log("del notification is ", delNotification);
      }

      let delSharedDeals = await Shared_Deals.destroy({
        where: {
          createdBy: userId,
          dealId,
          userId: shareduser,
        },
      });

      if (delSharedDeals) {
        return res.status(200).send({
          success: true,
          message: "All shared deals deleted",
          ShareDeal,
          delSharedDeals,
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Cannot delete shared deals",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "Shared deals not found",
      });
    }
  } catch {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
exports.dealDraftAnalysis = async (req, res, next) => {
  try {
    const { Deal, User, Video, Payment_logs } = req.db.models;
    const { userId } = req?.auth?.data;
    //const { dealId } = req?.params;
    //let query_obj = {};

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      console.log("Here ", user);
      let deals = await Deal.findAll({
        where: {
          is_draft: true,
        },

        include: [
          {
            model: User,
            required: true,
          },
        ],
      });

      if (deals) {
        return res.status(200).json({
          message: "deal analysis is ",
          success: true,
          dealAnalysis: deals,
        });
      } else {
        return res.status(200).json({
          message: "no deals found",
          success: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "User Not Found",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
// exports.getShareDealWithUser = async (req, res) => {
//   try {
//     const { Deal, Shared_Deals, User } = req.db.models;
//     const { userId } = req?.auth?.data;
//     console.log("userId", userId);

//     const dealExist = await Shared_Deals.findAll({
//       where: { userId },
//       include: [
//         { model: Deal },
//         { model: User, attributes: ["fullName", "id"] },
//       ],
//     });
//     console.log("dealExist", dealExist);
//     if (dealExist) {
//       return res.status(200).send({ status: true, data: dealExist });
//     } else {
//       return res.status(200).json({
//         message: "Deal Not Found",
//         success: false,
//         code: 121,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 123,
//     });
//   }
// };
exports.specificDeals = async (req, res, next) => {
  try {
    const { Shared_Deals, User, Deal } = req.db.models;
    //const { userId } = req?.auth?.data;
    //console.log("query_obj", query_obj);
    let deal = await Shared_Deals.findAll({
      include: [
        {
          model: User,
          attributes: ["fullName"],
        },
        {
          model: Deal,
          attributes: ["deal_name", "deal_created_by"],
          include: {
            model: User,
            attributes: ["fullName"],
          },
        },
      ],
    });
    if (deal && deal.length) {
      return res.status(200).json({
        deal_data: deal,
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "Shared Deals Not Found",
        success: false,
        code: 121,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.dealAnalysisForApp = async (req, res, next) => {
  try {
    const { Deal, User, Video, Payment_logs } = req.db.models;
    const { userId } = req?.auth?.data;
    //const { dealId } = req?.params;
    //let query_obj = {};

    let user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      console.log(user);
      let deals = await Deal.findAll({
        where: {
          deal_created_by: userId,
        },

        include: [
          {
            model: User,
            required: true,
          },
        ],
      });

      if (deals) {
        return res.status(200).json({
          message: "deal analysis is ",
          success: true,
          deal_data: deals,
        });
      } else {
        return res.status(200).json({
          message: "no deals found",
          success: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "User Not Found",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};
