const requires= require("../../utils/requires");



const {
  addElementIfNonExisting,
  removeElement,
} = requires.services.metadata;
const { generateMongooseId } = require("../../utils/generalUtils/utils");
const { ensureArrayContains, verifyEqual } = require("../../utils/testsUtils");

describe("should be able to add element to arr", () => {
  const field = "category";
  it("when there are no preexisting element", () => {
    const firstElement = {
      category: "category 1",
      adminId: generateMongooseId(),
    };
    const arr = [];
    addElementIfNonExisting(field, arr, firstElement);
    const stored = arr[0];
    verifyEqual(firstElement.category, stored.category);
    ensureArrayContains(stored.adminIds, firstElement.adminId);
  });
  it("should not add element if the elem already exists in the array but only add the admin Id ", () => {
    const testCategory = "category 1";
    const category1 = {
      category: testCategory,
      adminId: generateMongooseId(),
    };
    const category1DifferentAdmin = {
      category: testCategory,
      adminId: generateMongooseId(),
    };
    const arr = [];
    addElementIfNonExisting(field, arr, category1);
    addElementIfNonExisting(field, arr, category1DifferentAdmin);
    verifyEqual(arr.length, 1);
    const stored = arr[0];
    verifyEqual(stored.category, testCategory);
    const adminIds = stored.adminIds;
    verifyEqual(adminIds.length, 2);
    ensureArrayContains(adminIds, category1.adminId);
    ensureArrayContains(adminIds, category1DifferentAdmin.adminId);
  });

  it("should not add an adminId if the admin already exists. ", () => {
    const testCategory = "category 1";
    const testAdminId = generateMongooseId();
    const category1 = {
      category: testCategory,
      adminId: generateMongooseId(),
    };
    const category1DifferentAdmin = {
      category: testCategory,
      adminId: testAdminId,
    };
    const sameCategorySameAdmin = {
      category: testCategory,
      adminId: testAdminId,
    };
    const arr = [];
    addElementIfNonExisting(field, arr, category1);
    addElementIfNonExisting(field, arr, category1DifferentAdmin);
    addElementIfNonExisting(field, arr, sameCategorySameAdmin);
    verifyEqual(arr.length, 1);
    const stored = arr[0];
    verifyEqual(stored.category, testCategory);
    const adminIds = stored.adminIds;
    verifyEqual(adminIds.length, 2);
    ensureArrayContains(adminIds, category1.adminId);
    ensureArrayContains(adminIds, category1DifferentAdmin.adminId);
  });
});

describe("should remove an element", () => {
  const field = "category";
  const category1 = {
    category: "category 1",
    adminId: generateMongooseId(),
  };
  const category2 = {
    category: "category 2",
    adminId: generateMongooseId(),
  };
  const category3 = {
    category: "category 3",
    adminId: generateMongooseId(),
  };

  const arr = [];

  addElementIfNonExisting(field, arr, category1);
  addElementIfNonExisting(field, arr, category2);
  addElementIfNonExisting(field, arr, category3);
  const updated = removeElement(field, arr, category1.category);
  verifyEqual(updated.length, 2);
});
