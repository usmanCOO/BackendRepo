module.exports = (req, res, next) => {
  // if (!req.session.isLoggedIn) {
  //     return res.redirect('/login');
  // }
  console.log("NEXTTTTTTTTTTTTTTTTTTTTT");
  next();
};

var jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  console.log("start of verifyToken");
  console.log(req.headers);
  console.log("start of userId");
  console.log(req.userId);
  const token = req.headers["authorization"];
  const bearerToken = token.split(" ");
  const newtoken = bearerToken[1];
  console.log(newtoken);

  if (!newtoken) {
    res.send("Token Not Found!");
  } else {
    jwt.verify(newtoken, process.env.JWT_TOKEN_KEY, (err, decoded) => {
      if (err) {
        console.log("authentication failed");
      } else {
        console.log("Decoded is ");
        console.log(decoded);
        console.log(decoded.id);
        req.userId = decoded.id;
        console.log("Message is ");
        console.log(req.msg);
        req.msg = "message";
        console.log("Message is ");
        console.log(req.msg);
        console.log("authentication successful");
        next();
      }
    });
  }
};

const verifyRole = (req, res, next) => {
  console.log("In verify Role");
  const { User } = req.db.models;
  const loggedInId = req?.auth?.data?.userId;
  console.log("Signed in id is ", loggedInId);

  User.findOne({
    where: {
      id: loggedInId,
    },
  })
    .then((admin) => {
      console.log("In then user");
      if (admin?.role_id == 1) {
        console.log("Admin found and is Super Admin");
        next();
      } else if (admin?.role_id == 2) {
        console.log("Admin found but not authorized");
        return res
          .status(200)
          .send({ status: false, message: "Unauthorized Admin" });
      } else {
        console.log(" Not Found any Admin ");
        return res
          .status(200)
          .send({ status: false, message: " Not Found any Admin " });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).send({
        status: false,
        message: "Error",
        error,
      });
    });
};

module.exports = verifyToken;
module.exports = verifyRole;
