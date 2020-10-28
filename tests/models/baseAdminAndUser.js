const bcrypt = require("bcrypt");
const {clearTheDb} = require("../utils/generalUtils");
const {verifyEqual, verifyTruthy} = require("../utils/testsUtils");

const TRIALS = 2;
const MAX_WAITING_TIME_IN_MS = 6000;
const baseAuthTest = Model => {
  afterAll(async () => {
    await clearTheDb();
  });
  it("createNew creates a new document", async () => {
    const data = {
      name: "John Doe",
      email: "johndoe77@gmail.com",
      password: "johndoe@4899.???",
    };
    const document = await Model.createOne(data);
    verifyEqual(document.name, data.name);
    verifyEqual(document.email, data.email);

    //confirmPassword uses bycrypt.if we pass plain passwords to it, it will return false even if the password are the same.
    //for it to return truth the second password must be a hash of the first one.
    const passWordCorrectlyHashed = await confirmPassword(
      data.password,
      document.password
    );
    verifyTruthy(passWordCorrectlyHashed);
  });
  describe("After creatiion", () => {
    describe("Static Methods", () => {
      let searchData = [];
      beforeAll(
        async () => {
          searchData = await createTrialDocumentsAndReturnSearchData();
        },
        //in each document creation ,there is hashing of password which computation intensive,
        // so we need to allocate more time to it.
        MAX_WAITING_TIME_IN_MS
      );
      afterAll(async () => {
        await clearTheDb();
      });
      it("findByEmail finds document by email", async () => {
        const searchEmail = searchData[randomIndex()].email;
        const emailDoc = await Model.findByEmail(searchEmail);
        verifyEqual(emailDoc.email, searchEmail);
      });

      it("findOneWithCredentials finds a document matching the email and password", async () => {
        const {password, email} = searchData[randomIndex()];
        const verifiedDoc = await Model.findOneWithCredentials(email, password);
        verifyEqual(verifiedDoc.email, email);
        verifyTruthy(await confirmPassword(password, verifiedDoc.password));
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
        document = await createOneDocWIthPassword(hashedPassword);
      });
      afterEach(async () => {
        await clearTheDb();
      });
      describe("update update the given field with the given data.", () => {
        it("name", async () => {
          const newName = "John Doe 3";
          await document.update("name", newName);
          verifyEqual(newName, document.name);
        });
        it("email", async () => {
          const newEmail = "somerandom@gmail.com";
          await document.update("email", newEmail);
          verifyEqual(newEmail, document.email);
        });
        it("password", async () => {
          const newPassword = "johndoes@!2345?";
          await document.update("password", newPassword);
          const passwordChanged = await confirmPassword(
            newPassword,
            document.password
          );
          verifyTruthy(passwordChanged);
        });
        it("tel", async () => {
          const newTel = "0723475788";
          await document.update("tel", newTel);
          verifyEqual(newTel, document.tel);
        });
      });

      it("isPasswordCorrect checks password correctness", async () => {
        const passwordCorrect = await document.isPasswordCorrect(password);
        verifyTruthy(passwordCorrect);
      });
      it("deleteAccount() deletes the current account", async () => {
        const documentId = document.id;
        await document.deleteAccount();
        const currentDoc = await Model.findById(documentId);
        expect(currentDoc).toBeNull();
      });
    });
  });

  const confirmPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };
  const hashPassword = async password => {
    return await bcrypt.hash(password, 12);
  };

  const randomIndex = () => {
    return Math.floor(Math.random() * (TRIALS - 1));
  };

  const createOneDocWIthPassword = async hashedPassword => {
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
   * search data is the data that is used to create the docs.
   */
  const createTrialDocumentsAndReturnSearchData = async () => {
    const searchData = [];
    for (let index = 0; index < TRIALS; index++) {
      const randomPassword = `Smaihz${Math.ceil(
        Math.random() * 1000
      )}??8${Math.ceil(Math.random() * 1000)}`.trim();

      const name = `John Doe ${Math.floor(Math.random() * 10000)}`;
      const password = await hashPassword(randomPassword);
      const email = `johndoe${Math.ceil(
        Math.random() * 1000
      )}@gmail.com`.trim();

      let document = new Model({name, email, password});
      await document.save();

      const id = document.id;
      searchData.push({email, password: randomPassword, id});
    }
    return searchData;
  };
};

module.exports = baseAuthTest;
