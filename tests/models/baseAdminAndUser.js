const bcrypt = require("bcrypt");

const {clearTheDb} = require("../utils/generalUtils");
const {verifyEqual, verifyTruthy} = require("../utils/testsUtils");

//Trials are normal trials
//that are done in creation
//of documents with different
//passwords. It much smaller
// than emailTrials since
// emailsTrial creates documents
//with defferent emails but
// have the same prehashed
//password but Trial
// has to hash new passwords
//every time it creates
//a new document which is  very
// computive intensive.
const TRIALS = 20;
const emailTrials = 1000;

const MAX_WAITING_TIME_IN_MS = 200000;

const data = {
  name: "John Doe",
  email: "johndoe77@gmail.com",
  password: "johndoe@4899.???",
};
const baseAuthTest = Model => {
  it("createNew creates a new document", async () => {
    await throwsErrorsWhenProvideInvalidInputValues();

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
      let emailSearchData = [];
      beforeAll(
        async () => {
          emailSearchData = await createTrialCommonPasswordDocumentsAndReturnSearchData(
            emailTrials
          );
          searchData = await createTrialDocumentsAndReturnSearchData();
        },
        //in each document creation ,there is hashing of password which computation intensive,
        // so we need to allocate more time to it.
        MAX_WAITING_TIME_IN_MS
      );
      afterAll(async () => {
        await clearTheDb();
      }, MAX_WAITING_TIME_IN_MS);
      it("findByEmail finds document by email", async () => {
        const searchEmail = emailSearchData[randomIndex(emailTrials)].email;
        const emailDoc = await Model.findByEmail(searchEmail);
        verifyEqual(emailDoc.email, searchEmail);
      });

      it("findOneWithCredentials finds a document matching the email and password", async () => {
        const {password, email} = searchData[randomIndex(TRIALS)];
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
      describe("update updates the given field with the given data.", () => {
        it("name", async () => {
          const errorMessage = "Name should be 10-22 long";
          const invalidName = "sa";
          //await throwsWhenFieldHasErrors("name", invalidName, errorMessage);
          const newName = "John Doe 3";
          await document.update("name", newName);
          verifyEqual(newName, document.name);
        });
        it("email", async () => {
          const errorMessage = "Email should be 10-30 long";
          const invalidEmail = "sa@e";
          //await throwsWhenFieldHasErrors("email", invalidEmail, errorMessage);

          const newEmail = "somerandom@gmail.com";
          await document.update("email", newEmail);
          verifyEqual(newEmail, document.email);
        });
        it("password", async () => {
          const errorMessage = "Password should be 8-20 long";
          const invalidPassword = "samuel";
          // await throwsWhenFieldHasErrors(
          //   "password",
          //   invalidPassword,
          //   errorMessage
          // );

          const newPassword = "johndoes@!2345?";
          await document.update("password", newPassword);
          const passwordChanged = await confirmPassword(
            newPassword,
            document.password
          );
          verifyTruthy(passwordChanged);
        });
        it("tel", async () => {
          const errorMessage = "Tel should be exactly 13 digits long.";
          const invalidTel = "+46578999";
          //await throwsWhenFieldHasErrors("name", invalidTel, errorMessage);

          const newTel = "+254723475788";
          await document.update("tel", newTel);
          verifyEqual(newTel, document.tel);
        });
        async function throwsWhenFieldHasErrors(field, data, errorMessage) {
          console.log(document);
          await expect(document.update(field, data)).toThrow(errorMessage);
        }
      });
      describe("updateManyFields updates many fields", () => {
        it("updates on one field data", async () => {
          const oneField = {
            name: "Some Random Data",
          };
          await document.updateManyFields(oneField);
          expect(document.name).toBe(oneField.name);
        });

        it("Updates on all field data", async () => {
          const allFieldsData = {
            name: "SomeDummyName",
            email: "random12@gmail.com",
            password: "Random2344?",
            tel: "+234788434448",
          };
          await document.updateManyFields(allFieldsData);

          expect(document.name).toBe(allFieldsData.name);
          expect(document.email).toBe(allFieldsData.email);
          expect(document.tel).toBe(allFieldsData.tel);
          //password is hashed.
          //we can only confirm it.
          expect(
            await confirmPassword(allFieldsData.password, document.password)
          ).toBeTruthy();
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

  const randomIndex = range => {
    return Math.floor(range - 1);
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
      const email = `johndoe${index}@gmail.com`.trim();

      let document = new Model({name, email, password});
      await document.save();

      const id = document.id;
      searchData.push({email, password: randomPassword, id});
    }
    return searchData;
  };
  const createTrialCommonPasswordDocumentsAndReturnSearchData = async TRIALS => {
    const searchData = [];
    const rawPassword = "Smaina67??";
    const password = await hashPassword(rawPassword);

    for (let index = 0; index < TRIALS; index++) {
      const name = `Samuel Maina ${Math.floor(Math.random() * 10000)}`;
      const email = `samuelm${index}@gmail.com`.trim();

      let document = new Model({name, email, password});
      await document.save();

      const id = document.id;
      searchData.push({email, password: rawPassword, id});
    }
    return searchData;
  };

  const ranges = {
    name: [5, 20],
    email: [8, 30],
    password: [8, 20],
    //tel is standard for all country( 13 numbers long)
    tel: 13,
  };

  const errorMessages = {
    nonString: "Non-string fields not allowed.",
    name: `Name should be ${ranges.name[0]}-${ranges.name[1]} characters long.`,
    email: `Email should be ${ranges.email[0]}-${ranges.email[1]} characters long.`,
    password: `Password should be ${ranges.password[0]}-${ranges.password[1]} characters long.`,
    tel: `Tel should be ${ranges.tel}characters long.`,
  };
  async function throwsErrorsWhenProvideInvalidInputValues() {
    await rejectsOutOfRangeName();
    await rejectsOutOfRangeEmail();
    await rejectsOutOfRangePasswords();
  }
  const {name, email, password} = data;

  const rejectsOutOfRangeName = async () => {
    const nonStringName = 458;
    const tooShortName = "sa";
    const tooLongName = "johndoemillennialinThatIslgkejrkejklrjekl";

    await expect(
      Model.createOne({
        name: nonStringName,
        email,
        password,
      })
    ).rejects.toThrow(errorMessages.nonString);

    await expect(
      Model.createOne({
        name: tooShortName,
        email,
        password,
      })
    ).rejects.toThrow(errorMessages.name);
    await expect(
      Model.createOne({
        name: tooLongName,
        email,
        password,
      })
    ).rejects.toThrow(errorMessages.name);
  };
  const rejectsOutOfRangeEmail = async () => {
    const nonStringEmail = 494;
    const tooShortEmail = "sam@e";
    const tooLongEmail = "samuelmaynasirjjfkjdkfjd@email.com";
    await expect(
      Model.createOne({
        name,
        email: nonStringEmail,
        password,
      })
    ).rejects.toThrow(errorMessages.nonString);
    await expect(
      Model.createOne({
        name,
        email: tooShortEmail,
        password,
      })
    ).rejects.toThrow(errorMessages.email);
    await expect(
      Model.createOne({
        name,
        email: tooLongEmail,
        password,
      })
    ).rejects.toThrow(errorMessages.email);
  };
  const rejectsOutOfRangePasswords = async () => {
    const nonStringPassword = 49;
    const tooShortPassword = "rects";
    const tooLongPassword = "Psernnfdkfndkfnd344437989843";
    await expect(
      Model.createOne({
        name,
        email,
        password: nonStringPassword,
      })
    ).rejects.toThrow(errorMessages.nonString);
    await expect(
      Model.createOne({
        name,
        email,
        password: tooShortPassword,
      })
    ).rejects.toThrow(errorMessages.password);
    await expect(
      Model.createOne({
        name,
        email,
        password: tooLongPassword,
      })
    ).rejects.toThrow(errorMessages.password);
  };
};

module.exports = baseAuthTest;
