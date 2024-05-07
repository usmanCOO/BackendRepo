const { response } = require("express");
const Category = require("../../models/Category");

exports.getCategory = async (req, res) => {
  const db = req.db;
  const models = db.models;
  const categoryModel = models.Category;
  const fetchedCategory = await categoryModel.findAll({order: [
    ['order', 'ASC']
],}); 
  
  res.send({ success: true, messgae: "anything", category: fetchedCategory });
};

exports.getAllCategoryNames = async (req, res, next) => {
  try {
    const { Category } = req?.db?.models;

    let categoryNames = await Category.findAll({
      where: {
        is_delete: false,
      },
      order: [
        ['order', 'ASC']
    ],
      attributes: ["id", "name"],
    });

    if (categoryNames?.length) {
      console.log(categoryNames);
      return res.status(200).json({
        success: true,
        message: "All Categories names Found",
        categoryNames: categoryNames,
      });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Categories names Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
    });
  }
};

exports.createCategory = async (req, res) => {
  console.log(req.body);
  const db = req.db;
  const models = db.models;
  const categoryModel = models.Category;
  const categoryCreated = await categoryModel.create({
    name: req.body.name,
  });
  console.log("reqest body", categoryModel);

  res.send({
    success: true,
    messgae: "my caretegprt categpory response",
    data: categoryCreated,
  });
};

exports.updateCategpry = async (req, res) => {
  //console.log("string",req.body)
  const category_id = req.params.id;
  const db = req.db;
  const models = db.models;
  const categoryModel = models.Category;
  let { name: categoryName, metadata: categoryMetaData } = req.body;
  console.log(categoryMetaData);
  //categoryMetaData = JSON.parse(categoryMetaData);
  categoryModel
    .findOne({
      where: { id: category_id },
    })
    .then((category) => {
      categoryModel
        .update(
          {
            name: categoryName ? categoryName : category.name,
          },
          {
            where: {
              id: category_id,
            },
          }
        )
        .then((response) => {
          console.log(typeof categoryMetaData);
          res.status(200).send({
            success: true,
            message: "Category updated",
            updated_category: response,
          });
        })
        .catch((error) => {
          res.status(200).send({
            success: false,
            message: `Cannot update category ${error}`,
          });
        });
    })
    .catch((error) => {
      return res.status(200).json({
        message: `try/catch err: ${error}`,
        success: false,
      });
    });
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryDeleteId = req?.params?.id;
    const { Category } = req.db.models;

    let category = await Category.findOne({
      where: {
        id: categoryDeleteId,
      },
    });

    if (category) {
      category
        .update(
          {
            is_delete: !category.is_delete,
          },
          {
            where: {
              id: categoryDeleteId,
            },
          }
        )
        .then((updated) => {
          res.status(200).send({
            success: true,
            message: "Category soft deleted",
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            message: `try/catch err: ${error}`,
            success: false,
          });
        });
    } else {
      return res.status(200).send({
        success: false,
        message: "Cannot delete category",
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
