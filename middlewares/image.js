const multer = require("multer");

//multer Image storage
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./public/src/images");
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + "-" + file.originalname);
    },
  });
  
  const singleUpload = multer({ storage: storage }).single("img");

  module.exports = singleUpload