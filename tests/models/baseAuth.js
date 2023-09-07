const { database, utils } = require("../utils/generalUtils");
const requires = require("../utils/requires");
const { clearDb } = database;
const { returnObjectWithoutProp, generateStringSizeN } = utils;

const {
  verifyFalsy,
  verifyEqual,
  verifyTruthy,
  verifyNull,
  verifyRejectsWithError,
  ensureObjectHasKeyValuePair,
} = require("../utils/testsUtils");

const {
  ValidationError,
  hashPassword,
  confirmPassword,
  mergeBintoA,
} = require("./utils");

const ranges = requires.constrains.base;

const MAX_SETUP_TIME_IN_MS = 7000;

module.exports = (Model) => {
  describe("CreateOne", () => {
    const name = "John Doe";
    const email = "some@email.com";
    const password = "password12?";
    const credentials = {
      name,
      email,
      password,
    };
    afterEach(async () => {
      await clearDb();
    });

    const fields = ["name", "email"];
    for (const field of fields) {
      describe(field, () => {
        const { minlength, maxlength } = ranges[field];
        const otherFields = returnObjectWithoutProp(credentials, field);
        const data = {
          field,
          minlength,
          maxlength,
          otherFields,
          err: ValidationError,
        };
        validateStringField(data);
      });
    }

    describe("password", () => {
      const field = "password";
      const { minlength, maxlength, error } = ranges[field];
      const otherFields = returnObjectWithoutProp(credentials, field);
      const data = {
        field,
        minlength,
        maxlength,
        otherFields,
        err: error,
      };
      validateStringField(data);
    });

    function validateStringField(testData) {
      const { field, minlength, maxlength, otherFields, err } = testData;
      it(`reject ${field} non-string`, async () => {
        await runErrorTest([1, 2]);
      });
      describe(`reject ${field} < ${minlength} and  > ${maxlength} long.`, () => {
        it(`< ${minlength}`, async () => {
          await runErrorTest(generateStringSizeN(minlength - 1));
        });
        it(`> ${maxlength}`, async () => {
          await runErrorTest(generateStringSizeN(maxlength + 1));
        });
      });
      it(`does not throw on valid ${field}`, async () => {
        await runSuccesstTest(generateStringSizeN(minlength));
        await runSuccesstTest(generateStringSizeN(maxlength));
      });
      async function runErrorTest(data) {
        await ensureThrows(field, data, otherFields, err);
      }
      async function runSuccesstTest(data) {
        await ensureDoesNotThrow(field, data, otherFields);
      }

      const createArguementObject = (field, data, otherFields) => {
        const arg = {};
        arg[field] = data;

        return mergeBintoA(arg, otherFields);
      };
      async function ensureThrows(field, data, otherFields, err) {
        //if there are no  other otherfields, then the function
        //does takes one argument.
        if (!otherFields) {
          return await expect(Model.createOne(data)).rejects.toThrow(err);
        }
        //else we need to append the other fields into the param object
        let input = createArguementObject(field, data, otherFields);
        await expect(Model.createOne(input)).rejects.toThrow(err);
      }
      async function ensureDoesNotThrow(field, data, otherFields) {
        if (!otherFields) {
          return await expect(Model.createOne(data)).resolves.not.toThrow();
        }
        let input = createArguementObject(field, data, otherFields);
        const newDoc = await Model.createOne(input);

        if (field === "password") {
          verifyTruthy(await confirmPassword(data, newDoc[field]));
        } else {
          ensureObjectHasKeyValuePair(newDoc, field, data);
        }

        for (const prop in otherFields) {
          if (otherFields.hasOwnProperty.call(otherFields, prop)) {
            const element = otherFields[prop];
            if (prop === "password") {
              verifyTruthy(await confirmPassword(element, newDoc[prop]));
              continue;
            }
            ensureObjectHasKeyValuePair(newDoc, prop, element);
          }
        }
      }
    }
  });
  describe("After creation", () => {
    describe("Statics", () => {
      describe("findByEmail", () => {
        const N = 20;
        it("returns null on empty db", async () => {
          await clearDb();
          await ensureReturnsNullOnNonExistentEmail();
        });
        describe(`non empty`, () => {
          let emails;
          beforeAll(async () => {
            emails = createNEmails(N);
            await createDocsWithEmails(emails);
          }, MAX_SETUP_TIME_IN_MS);
          afterAll(async () => {
            await clearDb();
          });
          it("last email", async () => {
            const lastEmail = emails[N - 1];
            const lastDoc = await Model.findByEmail(lastEmail);
            verifyEqual(lastDoc.email, lastEmail);
          });
          it("returns null on non-existing", async () => {
            await ensureReturnsNullOnNonExistentEmail();
          });
        });
        async function ensureReturnsNullOnNonExistentEmail() {
          const nonExistentEmail = "random@email.com";
          await expect(Model.findByEmail(nonExistentEmail)).resolves.toBeNull();
        }
        async function createDocsWithEmails(emails) {
          //use the same hashed password for every doc since password hashing is very
          //computationally expensive
          const hashedCommonPassword = await hashPassword("Password45");
          for (const email of emails) {
            await docCreator("John Doe", hashedCommonPassword, email);
          }
        }
      });
      describe("findOneWithCredentials", () => {
        it("returns null on empty db", async () => {
          await clearDb();
          const email = "example@email.com",
            password = "password13";

          await Model.findOneWithCredentials(email, password);
        });
        describe(`Non empty db`, () => {
          let emails, passwords;
          //create small number of  test docs since password
          //hashing takes time.
          const N = 5;
          beforeAll(async () => {
            emails = createNEmails(N);
            passwords = createNPasswords(N);
            await createDocsWithCredentials(emails, passwords);
          }, MAX_SETUP_TIME_IN_MS);
          afterAll(async () => {
            await clearDb();
          });

          it("first email and first password", async () => {
            const firstEmail = emails[0];
            const firstPassword = passwords[0];

            const firstDoc = await Model.findOneWithCredentials(
              firstEmail,
              firstPassword
            );
            verifyEqual(firstDoc.email, firstEmail);
            //confirmPassword will ONLY return
            //true if the second arguement is the
            //the hash of the first.,as such
            //it can be used to show that the fetched doc has the same
            //password as the the given password.
            verifyTruthy(
              await confirmPassword(firstPassword, firstDoc.password)
            );
          });
          it("returns null if both email and password don't match", async () => {
            const firstEmail = emails[0];
            const secondPassword = passwords[1];
            const doc = await Model.findOneWithCredentials(
              firstEmail,
              secondPassword
            );
            expect(doc).toBeNull();
          });
        });
      });
    });
    describe("Methods", () => {
      let doc;
      const name = "John Doe";
      const email = "some@email.com";
      const password = "password12>>";
      beforeEach(async () => {
        const hash = await hashPassword(password);
        doc = await docCreator(name, hash, email);
      });
      afterEach(async () => {
        await clearDb();
      });
      describe("update", () => {
        describe("name ", () => {
          const { minlength, maxlength } = ranges.name;
          validate("name", minlength, maxlength, ValidationError);
        });
        describe("email ", () => {
          const { minlength, maxlength } = ranges.email;
          validate("email", minlength, maxlength, ValidationError);
        });
        describe("password ", () => {
          const { minlength, maxlength, error } = ranges.password;
          validate("password", minlength, maxlength, error);
        });

        describe("tel ", () => {
          const exact = ranges.tel;
          validate("tel", exact, exact, ValidationError);
        });

        function validate(field, minlength, maxlength, err) {
          it(`reject ${field} non-string`, async () => {
            await ensureThrows([1, 2]);
          });
          describe(`reject ${field} < ${minlength} and  > ${maxlength} long.`, () => {
            it(`< ${minlength}`, async () => {
              await ensureThrows(generateStringSizeN(minlength - 1));
            });
            it(`> ${maxlength}`, async () => {
              await ensureThrows(generateStringSizeN(maxlength + 1));
            });
          });
          it(`does not throw on valid ${field}`, async () => {
            await ensureDoesNotThrowAndDocUpdatedSuccessfully(
              generateStringSizeN(minlength)
            );
            await ensureDoesNotThrowAndDocUpdatedSuccessfully(
              generateStringSizeN(maxlength)
            );
          });
          async function ensureThrows(data) {
            await verifyRejectsWithError(async () => {
              await doc.update(field, data);
            }, err);
          }
          async function ensureDoesNotThrowAndDocUpdatedSuccessfully(data) {
            await doc.update(field, data);
            if (field === "password") {
              return verifyTruthy(await confirmPassword(data, doc[field]));
            }
            verifyEqual(data, doc[field]);
          }
        }
      });
      describe("updateMany", () => {
        it("one field", async () => {
          const newName = "newName";
          await doc.updateMany({
            name: newName,
          });
          verifyEqual(doc.name, newName);
        });
        it("all fields", async () => {
          const newName = "newName";
          const newEmail = "new@email.com";
          const newTel = "+254712345678";
          const newPassword = "Password5";
          await doc.updateMany({
            name: newName,
            email: newEmail,
            password: newPassword,
            tel: newTel,
          });
          verifyEqual(doc.name, newName);
          verifyEqual(doc.email, newEmail);
          verifyEqual(doc.tel, newTel);
          verifyTruthy(await confirmPassword(newPassword, doc.password));
        });
      });
      it("isCorrect", async () => {
        verifyTruthy(await doc.isCorrect(password));
        verifyFalsy(await doc.isCorrect("somerandomPas"));
      });
      it("markEmailAsConfirmed", async () => {
        await doc.markEmailAsConfirmed();
        verifyTruthy(doc.isEmailConfirmed);
      });
      it("delete", async () => {
        const docId = doc.id;
        await doc.delete();
        verifyNull(await Model.findById(docId));
      });
    });

    async function createDocsWithCredentials(emails, passwords) {
      const noOfEmails = emails.length;
      equal(
        noOfEmails,
        passwords.length,
        "some documents will either lack an email or a passwrod."
      );

      for (let i = 0; i < noOfEmails; i++) {
        const hash = await hashPassword(passwords[i]);
        await docCreator("John Doe", hash, emails[i]);
      }
    }
  });

  async function docCreator(name, password, email) {
    let doc = new Model({
      name,
      password,
      email,
    });
    return await doc.save();
  }
};

function createNEmails(N) {
  const emails = [];
  let email;
  for (let i = 0; i < N; i++) {
    email = `jdoe${i}@email${i}.com`;
    emails.push(email);
  }
  return emails;
}
function createNPasswords(N) {
  const passwords = [];
  let password;
  for (let i = 0; i < N; i++) {
    password = `${i}2password${i}@??`;
    passwords.push(password);
  }
  return passwords;
}
