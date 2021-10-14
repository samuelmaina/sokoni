const mongoose = require("mongoose");
const { metadata } = require("../services");
const ranges = require("../../config/constraints");
const {
  ensureStringIsLength,
  throwErrorIfStringLengthNotInRange,
  ensureIsMongooseId,
} = require("./utils");
const { removeElement } = require("../services/metadata");

const { addElementIfNonExisting } = metadata;

const { Schema, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const { category, brand } = ranges.product;

const Metadata = new Schema({
  categories: [
    {
      category: {
        type: String,
        required: "Category must be 1 to 200 characters long",
        minlength: 1,
        maxlength: 200,
      },
      adminIds: {
        type: [ObjectId],
        required: "Must provide admin Id.",
      },
    },
  ],
  brands: [
    {
      brand: {
        type: String,
        required: "Brand must be 1 to 200 characters  long",
        minlength: 1,
        maxlength: 200,
      },
      adminIds: {
        type: [ObjectId],
        required: "Admin Id must be provided.",
      },
    },
  ],
});

const { methods, statics } = Metadata;
statics.getSingleton = async function () {
  const singleton = await this.findOne().limit(1);
  if (!singleton) return new this();
  return singleton;
};

methods.addCategory = async function (category) {
  const field = "category";
  const categories = this.categories;
  ensureCategoryHasValidCategoryAndAdminId(category);
  addElementIfNonExisting(field, categories, category);
  return await this.save();
};

methods.removeCategory = async function (categoryName) {
  const field = "category";
  this.categories = removeElement(field, this.categories, categoryName);
  return await this.save();
};
methods.addBrand = async function (brand) {
  const field = "brand";
  const brands = this.brands;
  addElementIfNonExisting(field, brands, brand);
  return await this.save();
};

methods.getAllCategories = function () {
  const categories = this.categories;
  const result = [];
  for (const category of categories) {
    result.push(category.category);
  }
  return result;
};
methods.getAllCategoriesForAdminId = function (adminId) {
  const categories = this.categories;
  const result = [];
  for (const category of categories) {
    const adminIds = category.adminIds;
    if (adminIds.includes(adminId)) result.push(category.category);
  }
  return result;
};

methods.removeAdminIdFromCategory = async function (categoryName, adminId) {
  const categories = this.categories;
  if (categories.length < 1) {
    return;
  }
  const index = categories.findIndex((cp) => {
    return cp.category === categoryName;
  });
  const category = categories[index];
  const adminIds = category.adminIds;
  const updatedAdminIds = adminIds.filter((cp) => {
    return cp.toString() !== adminId.toString();
  });
  if (updatedAdminIds.length < 1) {
    const categoriesToSave = categories.filter((cp) => {
      return cp.category !== categoryName;
    });
    this.categories = categoriesToSave;
    return await this.save();
  }

  category.adminIds = updatedAdminIds;
  return await this.save();
};
methods.clear = async function () {
  this.brands = [];
  this.categories = [];
  return await this.save();
};

function ensureCategoryHasValidCategoryAndAdminId(categoryData) {
  const { minlength, maxlength, error } = category;
  ensureIsMongooseId(categoryData.adminId);
  throwErrorIfStringLengthNotInRange(
    categoryData.category,
    minlength,
    maxlength,
    error
  );
}
module.exports = model("Metadata", Metadata);
