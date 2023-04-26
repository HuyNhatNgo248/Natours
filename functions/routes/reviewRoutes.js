const express = require("express");
const reviewController = require("./../controller/reviewController");
const authController = require("./../controller/authController");

//by default: each router only has access to the parameters of their specific route
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo("admin", "user"),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo("admin", "user"),
    reviewController.updateReview
  );

module.exports = router;
