var multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Images");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.originalname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// exports.upload = multer({
//   storage: storage,
//   limits: { fileSize: "1000000" },
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png/;
//     //check the file if it has same extension as above which user uploads
//     const mimeType = fileTypes.test(file.mimetype);
//     const extname = fileTypes.test(path.extname(file.originalname));

//     if (mimeType && extname) {
//       return cb(null, true);
//     }
//     cb("Give proper files formate to upload");
//   },
// }).single("image");

// const imageStorage = multer.diskStorage({
//   // Destination to store image
//   destination: "Images",
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//     // file.fieldname is name of the field (image)
//     // path.extname get the uploaded file extension
//   },
// });

// exports.imageUpload = multer({
//   storage: imageStorage,
//   limits: {
//     fileSize: 1000000, // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     console.log("IMage upload");
//     if (!file.originalname.match(/\.(png|jpg)$/)) {
//       // upload only png and jpg format
//       return cb(new Error("Please upload a Image"));
//     }
//     cb(undefined, true);
//   },
// }).single("image");

// const fileupload = async (sampleFile) => {
//   console.log("Directory is ", __dirname);
//   let check;
//   let uploadPath = path.join(__dirname, "../../"); //It goes three folders or directories back from given __dirname.
//   console.log("path ", uploadPath);
//   sampleFile.name = Date.now() + sampleFile.name;
//   uploadPath = uploadPath + "/Images/" + sampleFile.name;
//   console.log("Directory is ", uploadPath);
//   await sampleFile.mv(uploadPath, function (err) {
//     if (err) {
//       console.log("In error ", err);
//       check = false;
//     } else {
//       console.log("here ");
//       console.log("Sample file name is ", sampleFile.name);
//       check = true;
//       //res.send(`File uploaded!`);
//     }
//   });
//   console.log("check is ", check);
//   return check;
// };

exports.imageVideo = async (req, res) => {
  const { userId } = req?.auth?.data?.userId;
  const { Video } = req.db.models;
  const { name, url } = req.body;
  let sampleFile;
  let uploadPath;
  console.log("req.body is ", req.body);

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  sampleFile = req.files.thumbnail;
  console.log("Sample file name is ", sampleFile);
  uploadPath = path.join(__dirname, "../../"); //It goes three folders or directories back from given __dirname.
  console.log("path ", uploadPath);
  sampleFile.name = Date.now() + "_" + sampleFile.name;
  uploadPath = uploadPath + "/Images/" + sampleFile.name;
  console.log("Directory is ", uploadPath);
  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      console.log("In error");
      return res.status(500).send(err);
    } else {
      console.log("here ", req.body);
      console.log("Sample file name is ", sampleFile.name);
      Video.create({
        name,
        url,
        video_createed_by: userId,
        thumbnail: sampleFile?.name,
      })
        .then((video) => {
          res.status(200).json({
            success: true,
            message: "video data added to db",
            data: video,
          });
        })
        .catch((error) => {
          return res.status(400).send({
            success: false,
            message: error,
          });
        });

      //res.send(`File uploaded!`);
    }
  });
};

exports.createVideo = (req, res) => {
  try {
    console.log(req.body);
    const { userId } = req?.auth?.data?.userId;
    const { Video } = req.db.models;
    const { name, url, imagepath } = req.body;
    // const uploadedImage = req.file.path;
    // console.log("File Path is ");
    // console.log("UploadedImage is ", uploadedImage);
    // const myArray = uploadedImage.split("Images\\");

    // console.log("Scheduled Event is ", myArray);

    //for multiple files
    //const uploadedImage = req.file.path;
    Video.create({
      name,
      url,
      video_createed_by: userId,
      thumbnail: imagepath,
    })
      .then((video) => {
        res.status(200).json({
          success: true,
          message: "video data added to db",
          data: video,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          success: false,
          message: error,
        });
      });

    res.status(200).json({
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.editVideo = async (req, res) => {
  try {
    const { Video } = req.db.models;
    const videoEditId = req?.params?.id;
    const { name, url } = req.body;
    const uploadedImage = req?.files?.sampleFile;
    let sampleFile;
    let uploadPath;
    let imagename;

    // console.log("Edited Video");
    let myArray;
    if (uploadedImage) {
      console.log("edit image");
      sampleFile = req.files.sampleFile;
      uploadPath = path.join(__dirname, "../../"); //It goes three folders or directories back from given __dirname.
      console.log("path ", uploadPath);
      sampleFile.name = Date.now() + "_" + sampleFile.name;
      uploadPath = uploadPath + "/Images/" + sampleFile.name;
      console.log("Directory is ", uploadPath);
      sampleFile.mv(uploadPath, function (err) {
        if (err) {
          console.log("In error");
          return res.status(500).send(err);
        } else {
          console.log("here ", req.body);
          console.log("Sample file name is ", sampleFile.name);
        }
      });

      // console.log(content);
    }
    //console.log(videoEditId);
    //console.log(req);
    Video.findOne({
      where: {
        id: videoEditId,
      },
    }).then(async (found) => {
      if (found) {
        await Video.update(
          {
            name: name ? name : found.name,
            url: url ? url : found.url,
            // content: contentReq ? contentReq : found.content,
            thumbnail: sampleFile?.name ? sampleFile?.name : found.thumbail,
          },
          {
            where: {
              id: videoEditId,
            },
          }
        );
        Video.findOne({
          where: {
            id: videoEditId,
          },
        })
          .then((updatedVideo) => {
            if (updatedVideo) {
              res.status(200).json({
                success: true,
                message: "Video Updated",
                data: updatedVideo,
              });
            } else {
              return res.status(200).send({
                success: false,
                message: "Canot update Video data Something went Wrong",
              });
            }
          })
          .catch((error) => {
            return res.status(200).json({
              message: `try/catch err: ${error}`,
              success: false,
            });
          });
      } else {
        res
          .status(200)
          .send({ success: false, message: "Video data doesn't exit" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
  //console.log("reqest body", businessCreated);
};

exports.deleteVideo = async (req, res) => {
  try {
    const { Video } = req.db.models;
    const videoDeleteId = req?.params?.id;
    console.log("Params are ", videoDeleteId);
    //const { heading: headingReq, content: contentReq } = req.body;
    //console.log(contentReq);

    Video.findOne({
      where: {
        id: videoDeleteId,
        isArchive: 0,
      },
    }).then(async (found) => {
      if (found) {
        console.log("Video found");
        Video.update(
          {
            isArchive: 1,
          },
          {
            where: {
              id: videoDeleteId,
            },
          }
        )
          .then((found) => {
            return res.status(200).send({
              success: true,
              message: "Video data archieved successfully",
            });
          })
          .catch((error) => {
            return res
              .status(200)
              .send({ success: false, message: "Is archieved already" });
          });
      } else {
        res
          .status(200)
          .send({ success: false, message: "cannot delete video" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
  //console.log("reqest body", businessCreated);
};

exports.getVideos = async (req, res) => {
  try {
    console.log("BACKEND ALL BUSINESSES");
    const { Video } = req.db.models;
    let video = await Video.findAll({
      where: {
        isArchive: 0,
      },
    });
    if (video?.length) {
      return res.status(200).json({
        message: "Videos data are found",
        success: true,
        video_data: video,
      });
    } else {
      return res.status(200).json({
        message: "No videos found",
        success: false,
        code: 121,
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

exports.getVideosForApp = async (req, res) => {
  try {
    console.log("BACKEND ALL BUSINESSES");
    const { Video } = req.db.models;
    let video = await Video.findAll({
      where: {
        isArchive: 0,
      },
    });
    if (video?.length) {
      return res.status(200).json({
        message: "Videos data are found",
        success: true,
        video_data: video,
      });
    } else {
      return res.status(200).json({
        message: "No videos found",
        success: false,
        code: 121,
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
