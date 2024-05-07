const express = require("express");
const router = express.Router();
const DealController = require("../app/controllers/DealController");

// router.post("/createdeals", DealController.createDeals);
router.put("/updatedeals/:dealid", DealController.updateDeals);
router.get("/getdeals/:dealId", DealController.getDeals);
router.delete("/deletedeals/:dealid", DealController.delDeals);
router.get("/dealanalysis", DealController.dealAnalysis);
router.get("/dealdraftanalysis", DealController.dealDraftAnalysis);
router.get("/specificdeals", DealController.specificDeals);
router.get("/isuserfirstdeal", DealController.checkUserFirstDeal);
router.get("/shareddealquestions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { QuestionResponse, Deal, Question } = req?.db?.models;
    QuestionResponse.findAll({
      where: {
        deal_id: id,
      },
      include: [
        {
          model: Question,
          required: false,
        },
      ],
    })
      .then((question) => {
        if (question.length) {
          res.status(200).send({
            success: true,
            message: "Questions are",
            question,
          });
        } else {
          res.status(200).send({
            success: true,
            message: "No questions found against this deal",
            question,
          });
        }
      })
      .catch((error) => {
        res.status(200).send({
          success: false,
          message: "Error",
          error,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
});

module.exports = router;
