const {equal} = require("assert");

const {
  clearTheDb,
  returnObjectWithoutProp,
  generateStringSizeN,
} = require("../utils/generalUtils");
const {
  verifyFalsy,
  verifyEqual,
  verifyTruthy,
  verifyNull,
  verifyRejectsWithError,
} = require("../utils/testsUtils");

const {
  ValidationError,
  hashPassword,
  confirmPassword,
  mergeBintoA,
} = require("./utils");

const ranges = require("../../config/constraints").base;

const MAX_SETUP_TIME_IN_MS = 10000;

module.exports = Model => {
  describe("CreateOne", () => {
    const name = "John Doe";
    const email = "some@email.com";
    const password = "password12>>";
    const credentials = {
      name,
      email,
      password,
    };
    afterEach(async () => {
      await clearTheDb();
    });
    describe(`Name`, () => {
      const field = "name";
      const {minlength, maxlength} = ranges[field];
      validate(
        field,
        minlength,
        maxlength,
        returnObjectWithoutProp(credentials, field),
        ValidationError
      );
    });
    describe(`Email`, () => {
      const field = "email";

      const {minlength, maxlength} = ranges[field];
      validate(
        field,
        minlength,
        maxlength,
        returnObjectWithoutProp(credentials, field),
        ValidationError
      );
    });
    describe(`Password`, () => {
      const field = "password";

      const {minlength, maxlength, error} = ranges[field];
      //password is not validated by
      //the schema(does not generate
      //ValidationError incase of violation) hence it validator
      //throws custom error.
      validate(
        field,
        minlength,
        maxlength,
        returnObjectWithoutProp(credentials, field),
        error
      );
    });

    function validate(field, minlength, maxlength, otherFields, err) {
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
        await ensureDoesNotThrowAndDocIsCreatedSuccessfully(
          generateStringSizeN(minlength)
        );
        await ensureDoesNotThrowAndDocIsCreatedSuccessfully(
          generateStringSizeN(maxlength)
        );
      });
      async function ensureThrows(data) {
        await verifyRejectsWithError(async () => {
          await Model.createOne(createdTestBody(data));
        }, err);
      }
      async function ensureDoesNotThrowAndDocIsCreatedSuccessfully(data) {
        const doc = await Model.createOne(createdTestBody(data));
        //doc having field with data
        ///and ensuring that the password
        //was hashed is enough to confirm
        //that doc was created.

        //for password ,if the doc password
        //is the same as the password passed
        //,then the doc was created successfully.
        if (field === "password") {
          return verifyTruthy(await confirmPassword(data, doc[field]));
        }

        verifyEqual(doc[field], data);
        verifyTruthy(await confirmPassword(otherFields.password, doc.password));
      }

      const createdTestBody = data => {
        const body = {};
        body[field] = data;
        return mergeBintoA(body, otherFields);
      };
    }
  });
  describe("After creation", () => {
    describe("Statics", () => {
      describe("findByEmail", () => {
        const N = 2000;
        it("returns null on empty db", async () => {
          await clearTheDb();
          await ensureReturnsNullOnUndefinedNullNonStringOrEmptyString();
          await ensureReturnsNullOnNonExistentEmail();
        });
        describe(`when db has ${N} docs`, () => {
          let emails;
          beforeAll(async () => {
            emails = createNEmails(N);
            await createDocsWithEmails(emails);
          }, MAX_SETUP_TIME_IN_MS);
          afterAll(async () => {
            await clearTheDb();
          });
          it("return null for value other than strings or empty string.", async () => {
            await ensureReturnsNullOnUndefinedNullNonStringOrEmptyString();
          });
          it("first email", async () => {
            const firstEmail = emails[0];
            const firstDoc = await Model.findByEmail(firstEmail);
            verifyEqual(firstDoc.email, firstEmail);
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
        async function ensureReturnsNullOnUndefinedNullNonStringOrEmptyString() {
          let undefined,
            nullValue = null,
            nonSting = 1234,
            empty = "";
          for (const invalid of [undefined, nullValue, nonSting, empty]) {
            await expect(Model.findByEmail(invalid)).resolves.toBeNull();
          }
        }
        async function createDocsWithEmails(emails) {
          const hashedCommonPassword = await hashPassword("Password45");
          for (const email of emails) {
            await docCreator("John Doe", hashedCommonPassword, email);
          }
        }
      });
      describe("findOneWithCredentials", () => {
        //create 20 test docs since password
        //hashing takes time.
        const N = 20;
        it("returns null on empty db", async () => {
          await clearTheDb();
          const email = "example@email.com",
            password = "password13";

          await Model.findOneWithCredentials(email, password);
          await ensureReturnsNullWhenEitherFieldsIsUndefinedNullNonStringOrEmptyString();
        });
        it("return null for value other than strings or empty string.", async () => {
          await ensureReturnsNullWhenEitherFieldsIsUndefinedNullNonStringOrEmptyString();
        });
        describe(`when db has ${N} docs`, () => {
          let emails, passwords;
          beforeAll(async () => {
            emails = createNEmails(N);
            passwords = createNPasswords(N);
            await createDocsWithCredentials(emails, passwords);
          }, MAX_SETUP_TIME_IN_MS);
          afterAll(async () => {
            await clearTheDb();
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
            //the hash of the first,so
            //it can be used to confirm
            //the two passwords are the
            //same.
            verifyTruthy(
              await confirmPassword(firstPassword, firstDoc.password)
            );
          });
          it("last email and last password", async () => {
            const lastEmail = emails[N - 1];
            const lastPassword = passwords[N - 1];
            const lastDoc = await Model.findOneWithCredentials(
              lastEmail,
              lastPassword
            );
            verifyEqual(lastDoc.email, lastEmail);
            verifyTruthy(await confirmPassword(lastPassword, lastDoc.password));
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
        async function ensureReturnsNullWhenEitherFieldsIsUndefinedNullNonStringOrEmptyString() {
          const email = "example@email.com";
          const password = "pa55word??";
          let undefined,
            nullValue = null,
            nonSting = 1234,
            empty = "";
          for (const invalid of [undefined, nullValue, nonSting, empty]) {
            //when email is invalid.
            await expect(
              Model.findOneWithCredentials(invalid, password)
            ).resolves.toBeNull();
            //when password is invalid.
            await expect(
              Model.findOneWithCredentials(email, invalid)
            ).resolves.toBeNull();
            //when both are invalid
            await expect(
              Model.findOneWithCredentials(invalid, invalid)
            ).resolves.toBeNull();
          }
        }
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
        await clearTheDb();
      });
      describe("update", () => {
        describe("name ", () => {
          const {minlength, maxlength} = ranges.name;
          validate("name", minlength, maxlength, ValidationError);
        });
        describe("email ", () => {
          const {minlength, maxlength} = ranges.email;
          validate("email", minlength, maxlength, ValidationError);
        });
        describe("password ", () => {
          const {minlength, maxlength, error} = ranges.password;
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
