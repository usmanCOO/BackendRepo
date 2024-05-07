const User = require("../../models/User");

exports.getResponseById = async (req, res, next) => {
  try {
    const { userid } = req?.auth?.data;
    const { QuestionResponse, Deal, Question } = req.db.models;
    const { dealId } = req?.params;

    const dealExist = await Deal.getById(dealId);
    if (!dealExist) {
      return res.status(200).json({
        message: "Deal Not Found",
        success: false,
        code: 121,
      });
    }
    const dealResponses = await QuestionResponse.findAll({
      where: { deal_id: dealId },
      include: [
        {
          model: Question,
          required: false,
        },
      ],
    });
    if (dealResponses) {
      return res.status(200).send({ status: true, data: dealResponses });
    } else {
      return res.status(200).send({ status: false, data: [] });
    }
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 123,
    });
  }
};

exports.getResponseByIdV2 = async (req, res, next) => {

	try{
		const {userid}=req?.auth?.data;
		const {QuestionResponse,Deal,Question,Category,CategoryLabel}=req.db.models;
		const {dealId}=req?.params;
	
		const dealExist=await Deal.getById(dealId);
		if(!dealExist){
			return res.status(200).json({
				message: "Deal Not Found",
				success: false,
				code: 121,
			  });
		}
		const dealResponses=await Category.findAll({
			include: [
				{model:CategoryLabel},
			  {
				model: Question,
				required: false,
				include:[{model:QuestionResponse,where:{deal_id:dealId},attributes:["response"],required: false }]
			  },
			],
		  });
		if(dealResponses){
			return res.status(200).send({ status: true, data: dealResponses })
		}
		else{
		return res.status(200).send({ status: false, data: [] })
	
		}
	}
	catch (err) {
		console.log("error", err);
		return res.status(500).json({
		  message: `try/catch err: ${err}`,
		  success: false,
		  code: 123,
		});
	  }
	};
