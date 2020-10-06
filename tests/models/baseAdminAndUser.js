const bcrypt = require("bcrypt");
const assert = require("assert");

const {clearDataFromAModel} = require("../utils/generalUtils");

const TRIALS = 2;

const MAX_WAITING_TIME_IN_MS = 50000;

const baseAuthTest = (Model) => {
  afterAll(async () => {
    await clearDataFromAModel(Model);
  });
  it("createNew creates a new document", async () => {
    const data = {
      name: "John Doe",
      email: "johndoe77@gmail.com",
      password: "johndoe@4899.???",
    };
    const document = await Model.createNew(data);
    expect(document.name).toEqual(data.name);
    expect(document.email).toEqual(data.email);

    //confirmPassword uses bycrypt.if we pass plain passwords to it, it will return false even if the password are the same.
    //for it to return truth the second password must be a hash of the first one.
    const passWordCorrectlyHashed = await confirmPassword(
      data.password,
      document.password
    );
    expect(passWordCorrectlyHashed).toBeTruthy();

    await Model.findByIdAndDelete(document.id);
  });
  describe("After creatiion", () => {
    describe("Static Methods", () => {
      let searchData = [];
      beforeAll(
        async () => {
          //clear existing data from model before creating TRIAL no of doc
          //.This is helpful for search operations.if previous data meets out creterion
          //the test fail.
          await clearDataFromAModel(Model);
          searchData = await createTrialDocumentsAndReturnSearchData();
        },
        //in each document creation ,there is hashing of password which computation intensive,
        // so we need to allocate more time to it.
        MAX_WAITING_TIME_IN_MS
      );
      afterAll(async () => {
        //search data contains the ids of the created documents.we will use it to delete
        //the created documents.
        await deleteAllDocumentsUsing(searchData);
      });
      it("findByEmail finds document by email", async () => {
        const searchEmail = searchData[randomIndex()].email;
        const emailDoc = await Model.findByEmail(searchEmail);
        expect(emailDoc.email).toEqual(searchEmail);
      });
      it("findOneWithCredentials finds a document matching the email and password", async () => {
        const {password, email} = searchData[randomIndex()];
        const documents = await Model.find();
        console.log(documents);
        console.log(searchData);
        const verifiedDoc = await Model.findOneWithCredentials(email, password);
        expect(verifiedDoc.email).toEqual(email);
        expect(await confirmPassword(password, verifiedDoc.password)).toBeTruthy();
      });
    });
    describe("Instance methods", () => {
      let document;
      let hashedPassword;
      const password = "johndoe84775??((e8r";
      beforeAll(async () => {
        //hashing is computation intensive.So we will use one hashedPassword for all the test..
        hashedPassword = await hashPassword(password);
      });

      beforeEach(async () => {
        document = await createOneDocument(hashedPassword);
      });
      afterEach(async () => {
        await Model.findByIdAndDelete(document.id);
      });
      it("resetPasswordTo function reset the document's password", async () => {
        const newPassword = "johndoes@!2345?";
        await document.resetPasswordTo(newPassword);
        const passwordChanged = await confirmPassword(newPassword, document.password);
        expect(passwordChanged).toBeTruthy();
      });

      it("checkIfPasswordIsValid checks password validity", async () => {
        const passwordCorrect = await document.checkIfPasswordIsValid(password);
        expect(passwordCorrect).toBeTruthy();
      });
      it("updateNameAndEmail updates document's name and email", async () => {
        const name2 = "samuel Maina 2";
        const email2 = "samuelmayna22@gmail.com";
        const data = {
          name: name2,
          email: email2,
        };
        await document.updateNameAndEmail(data);
        expect(document.name).toEqual(name2);
        expect(document.email).toEqual(email2);
      });
    });
  });

  const confirmPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
  };

  const randomIndex = () => {
    return Math.floor(Math.random() * (TRIALS - 1));
  };

  const createOneDocument = async (hashedPassword) => {
    const data = {
      name: "John Doe",
      email: "johndoe77@gmail.com",
    };
    let document = new Model({
      name: data.name,
      password: hashedPassword,
      email: data.email,
    });
    await document.save();
    return document;
  };

  /**
   * The search data is the data that was used to create the documents.
   * It will be used during querying in the tests and verfication of test results.
   */
  const createTrialDocumentsAndReturnSearchData = async () => {
    const searchData = [];
    for (let index = 0; index < TRIALS; index++) {
      const randomPassword = `Smaihz${Math.ceil(Math.random() * 1000)}??8${Math.ceil(
        Math.random() * 1000
      )}`.trim();

      const name = `John Doe ${Math.floor(Math.random() * 10000)}`;
      const password = await hashPassword(randomPassword);
      const email = `johndoe${Math.ceil(Math.random() * 1000)}@gmail.com`.trim();

      let document = new Model({name, email, password});
      await document.save();

      const id = document.id;
      searchData.push({email, password: randomPassword, id});
    }
    return searchData;
  };

  const deleteAllDocumentsUsing = async (searchData = []) => {
    for (let index = 0; index < TRIALS; index++) {
      await Model.findByIdAndDelete(searchData[index].id);
    }
  };
};

module.exports = baseAuthTest;
