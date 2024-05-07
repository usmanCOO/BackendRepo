//const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const env = require("dotenv");
env.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Op } = require("sequelize");
//const sequelize = require("../../config/config");
const sequelize = require("sequelize");

exports.createPaymentIntent = async (req, res) => {
  try {
    // console.log(req.auth);
    const { User } = req.db.models;
    const userId = req?.auth?.data?.userId;
    console.log("userId ", userId);
    const user = await User.findOne({ where: { id: userId }, raw: true });
    //console.log("user ", user);
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User Doesn't Exists By This Token",
      });
    }
    let email = user.email;
    console.log("Email is ", email);
    let existingCustomers = await stripe.customers.list({ email: email });
    console.log("existingCustomers", existingCustomers);
    if (existingCustomers.data.length) {
      // don't create customer if already exists
      console.log("Dont create", existingCustomers.data[0].id);

      // create charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount * 100,
        currency: "USD",
        customer: existingCustomers.data[0].id,
        description: "Customer Payment",
      });
      console.log(paymentIntent);
      res.status(200).send({
        success: true,
        message: "Payment has been made",
        paymentIntent: paymentIntent,
      });
    } else {
      console.log("create customer");
      //create customer first against email
      const customer = await stripe.customers.create({
        name: "Dealdoc Customer",
        email: user.email,
        address: {
          line1: "110 peter St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      });
      console.log(customer);
      if (customer) {
        //charge customer after creating customer
        const paymentIntent = await stripe.paymentIntents.create({
          amount: req.body.amount * 100,
          currency: "USD",
          customer: customer.id,
          description: "Customer Payment",
        });
        console.log(paymentIntent);
        if (paymentIntent) {
          res.status(200).send({
            success: true,
            message: "Payment has been made",
            paymentIntent: paymentIntent,
          });
        }
      } else {
        res.status(422).send({
          success: false,
          message: "Error Creating New Customer",
        });
      }
    }
  } catch (err) {
    console.log("err.isJoi: ", err);
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

exports.createPaymentLogs = async (req, res) => {
  try {
    const {
      payment_purchased_type,
      deal_name,
      payment_status,
      payment_amount,
      payment_response,
    } = req.body;
    const { Payment_logs } = req.db.models;

    const paymentCreated = await Payment_logs.create({
      payment_purchased_type,
      deal_name,
      payment_status,
      payment_amount,
      payment_response,
    });

    if (paymentCreated) {
      res.status(200).send({
        success: true,
        message: "Payment log created",
        paymentlog: paymentCreated,
      });
    } else {
      res.status(200).send({
        success: false,
        message: "cannot create Payment log",
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

exports.getAllPayemntlogs = async (req, res) => {
  try {
    const { Payment_logs } = req.db.models;
    let logs = await Payment_logs.findAll({});

    if (logs?.length) {
      //console.log(viewAdmins);
      return res.status(200).json({
        success: true,
        message: "All Payments logs are ",
        paymentlogs: logs,
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Cannot found any payment logs" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.getEachMonthEarnings = (req, res) => {
  try {
    const { Payment_logs } = req.db.models;
    let year = new Date().getFullYear();
    console.log("Year is ", year);
    Payment_logs.count({
      where: {
        payment_status: 1,
        createdAt: sequelize.where(
          sequelize.fn("YEAR", sequelize.col("createdAt")),
          year
        ),
      },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
        [sequelize.fn("sum", sequelize.col("payment_amount")), "total"],
      ],
      group: ["month"],
    })
      .then((result) => {
        console.log(result);
        res.status(200).send({
          success: true,
          message: "Each month earnings are",
          earning: result,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error", err });
  }
};

exports.getLastNDaysEarnings = async (req, res) => {
  try {
    const { Payment_logs } = req.db.models;
    const day = req.params.days;
    let todayDate = new Date();
    let previouDate = new Date();
    previouDate.setDate(previouDate.getDate() - day);
    console.log("Today date is ", todayDate);
    console.log("Date is ", previouDate);
    let logs;
    if (day === "all") {
      logs = await Payment_logs.findAll({
        where: {
          payment_status: 1,
        },
        attributes: [
          [sequelize.fn("sum", sequelize.col("payment_amount")), "total"],
        ],
      });
    } else {
      logs = await Payment_logs.findAll({
        where: {
          payment_status: 1,
          createdAt: {
            [Op.lte]: todayDate,
            [Op.gt]: previouDate,
          },
        },
        attributes: [
          [sequelize.fn("sum", sequelize.col("payment_amount")), "total"],
        ],
      });
    }
    if (logs.length > 0) {
      console.log("Earnings are ", logs);
      res.status(200).json({
        success: true,
        message: `Last ${day} days earnings are found`,
        // order_data: order,
        logs,
      });
    } else {
      res.status(200).send({ success: false, message: "Something went wrong" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error", err });
  }
};
