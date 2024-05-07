const { response } = require("express");
const express = require("express");
const router = express.Router();
const {
  getCategory,
  createCategory,
  updateCategpry,
  deleteCategory,
  getAllCategoryNames,
} = require("../app/controllers/CategoryController");

router.get("/getcategories", getCategory);
router.get("/viewcategorynames", getAllCategoryNames);
router.post("/createcategory", createCategory);
router.put("/updatecategory/:id", updateCategpry);
router.delete("/deletecategory/:id", deleteCategory);

module.exports = router;
