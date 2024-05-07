var jwt = require("jsonwebtoken");
const validator = require("validator");

exports.addComment = async (req, res) => {
  try {
    const { User, Comment, Shared_Deals, Notification } = req.db.models;
    const { userId } = req?.auth?.data;
    console.log("User ID is ", userId);
    let { deal_id, statement, replied_to } = req.body;
    console.log("In add comment");
    if (replied_to) {
      const commentExsist = await Comment.findOne({
        where: { id: replied_to },
      });
      if (!commentExsist) {
        return res.status(400).json({
          message: `Comment does not exist`,
          success: false,
          code: 103,
        });
      }
    }

    let dealExist = await Shared_Deals.findAll({
      where: { dealId: deal_id, isDeleted: false },
      attributes: ["userId", "createdBy"],
    });

    if (dealExist.length) {
      let comment = await new Comment({
        deal_id,
        statement,
        replied_to,
        created_by: userId,
      }).save();

      console.log("deal exist is ", dealExist);

      let bulkobjs = dealExist.map((data) => {
        console.log("in obj ", data.dataValues);
        obj = data.dataValues;
        let notification = {
          message: "New comment on deal",
          notification_type: "comment",
          read_status: false,
          send_to: obj.userId,
          deal_Id: deal_id,
          comment_Id: comment.id,
        };
        console.log("notification is ", notification);
        return notification;
      });

      let num = parseInt(dealExist[0].dataValues.createdBy);

      bulkobjs.push({
        message: "New comment on deal",
        notification_type: "comment",
        read_status: false,
        send_to: num,
        deal_Id: deal_id,
        comment_Id: comment.id,
      });

      console.log("before condition update is ", bulkobjs);

      bulkobjs = bulkobjs.filter((obj) => {
        if (obj.send_to != userId) {
          console.log(`obj.userId ${obj.userId} and userId ${userId}`);
          return obj;
        }
      });

      //console.log("bulk obj are ", newobj);

      Notification.bulkCreate(bulkobjs)
        .then((data) => {
          console.log("bulk created successfully!");
          return res.status(200).json({
            message: `Comment added`,
            success: true,
            data: comment,
            dealExist,
            bulkobjs,
          });
        })
        .catch((error) => {
          console.error("Error creating users:", error);
          return res.status(400).json({
            message: `Something went wrong!`,
            success: false,
            code: 104,
          });
        });
    } else {
      return res.status(400).json({
        message: `Something went wrong!`,
        success: false,
        code: 103,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 103,
    });
  }
};

exports.getComment = async (req, res) => {
  try {
    const { User, Comment, Replies } = req.db.models;
    const { userId } = req?.auth?.data;
    const { deal_id } = req?.params;

    let deal = await Comment.findAll({
      where: { deal_id, replied_to: null },
      include: [
        { model: Comment, as: "Replies", include: [User] },
        { model: User },
      ],
      order: [
        [
          { model: Comment, as: "Replies", include: [User] },
          "createdAt",
          "ASC",
        ],
      ],
    });

    return res.status(200).json({
      message: `Comment added`,
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
