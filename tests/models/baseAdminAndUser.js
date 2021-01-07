const bcrypt = require("bcrypt");

const {clearTheDb} = require("../utils/generalUtils");
const {verifyEqual, verifyTruthy} = require("../utils/testsUtils");

const {BaseServices} = require("../../database/services");
const {ranges, errorMessages} = BaseServices;
//general data that will be used
//for testing.
let undefined;
const nullValue = null;
const number = 1.1;
const emptyString = "";
const object = {
  name: "Object",
};
const array = [1, 2];

//we will use boundary analysis to
//provide errorneous data.
//for each range,we provide
// a string whose length is less than the
//lowerlimit by 1 and another that
//is greater than the upperlimit
//by 1.
const invalidData = {
  name: ["John", "John Doe Too LongName"],
  email: ["jon@doe", "johndoe123456789@gmail.com"],
  password: ["JohnDoe", "JohnDoe.!?123456"],
  tel: ["+254756789112", "+25475678911234"],
};

const MAX_WAITING_TIME_IN_MS = 100000;

const data = {
  name: "John Doe",
  email: "johndoe77@gmail.com",
  password: "johndoe@48.?",
};
const baseAuthTest = Model => {
  it("createNew creates a new document", async () => {
    const document = await Model.createOne(data);
    verifyEqual(document.name, data.name);
    verifyEqual(document.email, data.email);
    //ensure that the document gets the
    //default tel number.
    expect(document.tel).toEqual("+254700000000");
    //confirmPassword uses bycrypt.If passed plain passwords
    // to it, it will return false even if the password are the same.
    //for it to return truth the second password must be a hash of the first one.
    const isPasswordHashed = await confirmPassword(
      data.password,
      document.password
    );
    verifyTruthy(isPasswordHashed);
    await throwsErrorsWhenProvidedInvalidInputValues();
  });

  describe("After creatiion", () => {
    describe("Static Methods", () => {
      afterAll(async () => {
        await clearTheDb();
      }, MAX_WAITING_TIME_IN_MS);
      describe("findByEmail return doc with the given email.", () => {
        const N = 1000;
        //any string can be searched
        //even if it does not have
        //an email format, i.e "text@domain.domainTypeWithNoNumbers"

        it("Throws on non-string data or invalid email", async () => {
          await throwsOnRejectionData();
        });

        it("when db is empty ", async () => {
          await clearTheDb();
          await ensureReturnsNullOnNonExistentEmail();
        });

        describe("NonEmpty Database.", () => {
          //the password are not compared
          //as the ones in the database are
          //hashed.
          const fieldsToMatch = ["name", "email"];

          let credentials = [];
          beforeAll(async () => {
            doc = await createOneDoc(data);
            credentials = createTestCredentialsWithNoPasswords(N);
            //hashing password is computing
            //intensive, hence we hash one
            //password and use it to create many docs.
            docs = await createDocsHavingCommonPassword(credentials, password);
          }, MAX_WAITING_TIME_IN_MS);

          it("when db has only one email ", async () => {
            const retrievedDoc = await Model.findByEmail(data.email);
            ensureDocAndDataHasSameFields(retrievedDoc, data, fieldsToMatch);
            await ensureReturnsNullOnNonExistentEmail();
          });
          it(
            `when Db has ${N} emails`,
            async () => {
              const firstDoc = credentials[0];
              const lastDoc = credentials[N - 1];
              const returnedFirst = await Model.findByEmail(firstDoc.email);
              const returnedLast = await Model.findByEmail(lastDoc.email);
              ensureDocAndDataHasSameFields(
                firstDoc,
                returnedFirst,
                fieldsToMatch
              );
              ensureDocAndDataHasSameFields(
                lastDoc,
                returnedLast,
                fieldsToMatch
              );

              await ensureReturnsNullOnNonExistentEmail();
            },
            MAX_WAITING_TIME_IN_MS
          );
        });
        afterAll(async () => {
          await clearTheDb();
        });

        const ensureReturnsNullOnNonExistentEmail = async () => {
          const nonExistentEmail = "joe@gmail.com";
          await expect(Model.findByEmail(nonExistentEmail)).resolves.toBeNull();
        };
        async function throwsOnRejectionData() {
          const rejectionData = [undefined, nullValue, number, object, array];
          for (const data of rejectionData) {
            await expect(Model.findByEmail(data)).rejects.toThrowError(
              errorMessages.nonString
            );
          }
          const rejectEmails = [invalidData.email[0], invalidData.email[1]];
          for (const data of rejectEmails) {
            await expect(Model.findByEmail(data)).rejects.toThrowError(
              errorMessages.email
            );
          }
        }
      });

      describe("findOneWithCredentials finds a document matching the email and password", () => {
        const N = 100;

        it("empty db", async () => {
          await clearTheDb();
          await ensureReturnsNullOnNonExistentEmailAndPassword();
        });
        describe("Non-empty database", () => {
          const {email, password} = data;
          const fieldsToMatch = ["name", "email"];

          let credentials = [];
          beforeAll(async () => {
            doc = await createOneDoc(data);
            credentials = createTestCredentials(N);
            docs = await createDocsFromCredentials(credentials);
          }, MAX_WAITING_TIME_IN_MS);
          it("one doc Db", async () => {
            const retrievedDoc = await Model.findOneWithCredentials(
              email,
              password
            );
            ensureDocAndDataHasSameFields(retrievedDoc, data, fieldsToMatch);
            await ensureReturnsNullOnNonExistentEmailAndPassword();
          });

          it(`when Db has ${N} docs`, async () => {
            const firstDoc = credentials[0];
            const lastDoc = credentials[N - 1];
            let {email, password} = firstDoc;
            const returnedFirst = await Model.findOneWithCredentials(
              email,
              password
            );
            verifyTruthy(
              await confirmPassword(password, returnedFirst.password)
            );

            const returnedLast = await Model.findOneWithCredentials(
              lastDoc.email,
              lastDoc.password
            );
            ensureDocAndDataHasSameFields(lastDoc, returnedLast, fieldsToMatch);
            verifyTruthy(
              await confirmPassword(lastDoc.password, returnedLast.password)
            );
          });
        });
        it.skip("throws on when arguements are corrupt", async () => {
          await throwsOnRejectionData();
        });

        const ensureReturnsNullOnNonExistentEmailAndPassword = async () => {
          const nonExistentEmail = "joe@gmail.com";
          const nonExistentPassword = "password??55";
          await expect(
            Model.findOneWithCredentials(nonExistentEmail, nonExistentPassword)
          ).resolves.toBeNull();
        };

        async function throwsOnRejectionData() {
          const rejectionData = [undefined, nullValue, number, object, array];
          for (const data of rejectionData) {
            const validEmail = "johndoe@gmail.com";
            const password = "password123";
            await expect(
              Model.findOneWithCredentials(data, password)
            ).rejects.toThrowError(errorMessages.nonString);
            await expect(
              Model.findOneWithCredentials(validEmail, data)
            ).rejects.toThrowError(errorMessages.nonString);
          }
        }
      });
    });

    describe("Instance methods", () => {
      let document;
      let hashedPassword;
      const password = "johndoe8??((e8r";
      beforeAll(async () => {
        //hashing is computation intensive.So we will use one hashedPassword for all the test..
        hashedPassword = await hashPassword(password);
      });
      beforeEach(async () => {
        data.hashedPassword = hashedPassword;
        document = await createOneDocWIthHashedPassword(data);
      });
      afterEach(async () => {
        await clearTheDb();
      });
      describe("update updates the given field with the given data.", () => {
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
          const newTel = "+254723475788";
          await document.update("tel", newTel);
          verifyEqual(newTel, document.tel);
        });
      });
      describe("updateManyFields updates many fields", () => {
        it("updates on one field data", async () => {
          const fieldsToMatch = ["name"];
          const oneField = {
            name: "Some Random Data",
          };
          await document.updateManyFields(oneField);

          ensureDocAndDataHasSameFields(document, oneField, fieldsToMatch);
        });

        it("Updates on all field data", async () => {
          const fieldToMatch = ["name", "email", "tel"];

          const allFieldsData = {
            name: "SomeDummyName",
            email: "random12@gmail.com",
            password: "Random2344?",
            tel: "+234788434448",
          };
          await document.updateManyFields(allFieldsData);

          ensureDocAndDataHasSameFields(document, allFieldsData, fieldToMatch);
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

  const createTestCredentialsWithNoPasswords = howMany => {
    let credentials = [],
      name,
      lengthOfUniqueToken = 2,
      //inserted to the generated number to
      //make ensure that the string generated
      //is truly unique.
      uniqueToken,
      email;

    for (let i = 0; i < howMany; i++) {
      uniqueToken = generateUniqueToken(lengthOfUniqueToken);
      name = `John Doe ${i} ${uniqueToken}`;
      email = `johndoe${i}${uniqueToken}@gmail.com`;
      credentials.push({
        name,
        email,
      });
    }
    return credentials;
  };
  const createTestCredentials = howMany => {
    let credentials = [],
      lengthOfUniqueToken = 4,
      //inserted to the generated number to
      //make ensure that the string generated
      //is truly unique.
      uniqueToken,
      name,
      email,
      password;

    for (let i = 0; i < howMany; i++) {
      uniqueToken = generateUniqueToken(lengthOfUniqueToken);
      name = `John Doe ${i} ${uniqueToken}`;
      email = `johndoe${i}${uniqueToken}@gmail.com`;
      password = `johnDoe?${uniqueToken}kh`;
      credentials.push({
        name,
        email,
        password,
      });
    }
    return credentials;
  };
  const generateUniqueToken = length => {
    return Math.floor(Math.random() * Math.pow(10, length));
  };

  async function createDocsFromCredentials(credentials) {
    const howMany = credentials.length;
    for (let i = 0; i < howMany; i++) {
      await createOneDoc(credentials[i]);
    }
  }

  const createDocsHavingCommonPassword = async (data = [], password) => {
    const hashedPassword = await hashPassword(password);
    for (const datum of data) {
      datum.hashedPassword = hashedPassword;
      await createOneDocWIthHashedPassword(datum);
    }
  };

  const createOneDoc = async data => {
    const hashedPassword = await hashPassword(data.password);
    return await docCreator(data.name, data.email, hashedPassword);
  };

  const createOneDocWIthHashedPassword = async data => {
    return await docCreator(data.name, data.email, data.hashedPassword);
  };

  const docCreator = async (name, email, password) => {
    let doc = new Model({
      name,
      email,
      password,
    });
    return await doc.save();
  };

  async function throwsErrorsWhenProvidedInvalidInputValues() {
    await rejectsOutOfRangeName();
    await rejectsOutOfRangeEmail();
    await rejectsOutOfRangePasswords();
  }
  const {name, email, password} = data;

  const rejectsOutOfRangeName = async () => {
    const {name} = invalidData;
    await expect(
      Model.createOne({
        name: name[0],
        email,
        password,
      })
    ).rejects.toThrow(errorMessages.name);
    await expect(
      Model.createOne({
        name: name[1],
        email,
        password,
      })
    ).rejects.toThrow(errorMessages.name);
    let nonStringData = [undefined, nullValue, number, object, array];
    for (const data of nonStringData) {
      await expect(
        Model.createOne({
          name: data,
          email,
          password,
        })
      ).rejects.toThrow(errorMessages.nonString);
    }
  };
  const rejectsOutOfRangeEmail = async () => {
    const {email} = invalidData;
    await expect(
      Model.createOne({
        name,
        email: email[0],
        password,
      })
    ).rejects.toThrow(errorMessages.email);
    await expect(
      Model.createOne({
        name,
        email: email[1],
        password,
      })
    ).rejects.toThrow(errorMessages.email);
    //TODO:include an email that
    //that does not have the standard
    //email format.
    let nonEmailData = [undefined, nullValue, number, object, array];
    for (const data of nonEmailData) {
      await expect(
        Model.createOne({
          name,
          email: data,
          password,
        })
      ).rejects.toThrow(errorMessages.nonString);
    }
  };
  const rejectsOutOfRangePasswords = async () => {
    const {password} = invalidData;
    await expect(
      Model.createOne({
        name,
        email,
        password: password[0],
      })
    ).rejects.toThrow(errorMessages.password);
    await expect(
      Model.createOne({
        name,
        email,
        password: password[1],
      })
    ).rejects.toThrow(errorMessages.password);
    //TODO:
    //provide a string Password
    //that does not
    //conform to the application
    //specification.
    let nonPasswordData = [undefined, nullValue, number, object, array];
    for (const data of nonPasswordData) {
      await expect(
        Model.createOne({
          name,
          email,
          password: data,
        })
      ).rejects.toThrow(errorMessages.nonString);
    }
  };
};

const ensureDocAndDataHasSameFields = (doc, data, fields) => {
  if (fields.length < 1) throw new Error("No fields to compare.");
  for (const field of fields) {
    expect(doc[field]).toBe(data[field]);
  }
};

const confirmPassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
const hashPassword = async plain => {
  return await bcrypt.hash(plain, 12);
};

const randomIndex = range => {
  return Math.floor(range - 1);
};

module.exports = baseAuthTest;
