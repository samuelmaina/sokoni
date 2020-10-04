const bcrypt = require("bcrypt");

const { connectToDb, closeConnectionToBd } = require("../config");

const confirmPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(error);
  }
};
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const data = {
  name: "Samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smainachez900??((",
};
const { name, email, password } = data;

module.exports = (Model) => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });

  it("createNew creates a new document", async () => {
    const document = await Model.createNew(data);
    await Model.findByIdAndDelete(document.id);
    expect(document.name).toEqual(name);
    expect(document.email).toEqual(email);
    const passWordCorrectlyHashed = await confirmPassword(
      password,
      document.password
    );
    expect(passWordCorrectlyHashed).toBeTruthy();
  });
  describe("After creatiion", () => {
    let document;

    beforeAll(async () => {
      try {
        const person = {
          name: data.name,
          email: data.email,
          password: await hashPassword(password),
        };

        document = new Model(person);
        document = await document.save();
      } catch (error) {
        throw new Error(error);
      }
    });
    afterAll(async () => {
      await Model.findByIdAndDelete(document.id);
    });
    describe("Static Methods", () => {
      it("findByEmail finds document by email", async () => {
        const emailDoc = await Model.findByEmail(email);
        expect(emailDoc.email).toEqual(email);
      });
      it("findOneWithCredentials finds a document matching the email and password", async () => {
        const findOneDocument = await Model.findOneWithCredentials(
          email,
          password
        );
        expect(findOneDocument.email).toEqual(email);
        expect(findOneDocument.name).toEqual(name);
      });
    });
    describe(" instance methods for a document", () => {
      it("resetPasswordTo function reset the document's password", async () => {
        const newPassword = "Smainachez!2345?";
        await document.resetPasswordTo(newPassword);
        let passwordChanged = await confirmPassword(
          newPassword,
          document.password
        );
        expect(passwordChanged).toBeTruthy();
        passwordChanged = await confirmPassword(password, document.password);
        expect(passwordChanged).toBeFalsy();
        //reset the document;
        document.password = await hashPassword(password);
        document = await document.save();
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

        //reset the document;
        document.name = name;
        document.email = email;
        document = await document.save();
      });
    });
  });
};
