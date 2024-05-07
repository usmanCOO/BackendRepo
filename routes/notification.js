const express = require("express");
const router = express.Router();
const NotificationController = require("../app/controllers/NotificationController");

// router.get()
// router.post("/addnotification", NotificationController.CreateNotifications);
// router.put(
//   "/updatenotification/:id",
//   NotificationController.updateNotification
// );
// router.delete(
//   "/deletenotification/:id",
//   NotificationController.deleteNotification
// );

router.get("/viewnotifications", NotificationController.getNotification);
router.get(
  "/readnotification/:dealId",
  NotificationController.readNotification
);

module.exports = router;
