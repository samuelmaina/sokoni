const bcrypt = require("bcrypt");

const { connectToDb, closeConnectionToBd } = require("../config");

const personData = {
  name: "samuel Maina",
  email: "samuelmayna@gmail.com",
  password: "Smaina1234?",
};

const { name, email, password } = personData;

const confirmPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = (Model) => {
  const create = async () => {
    try {
      return await Model.createNew(personData);
    } catch (error) {
      throw new Error(error);
    }
  };

  const deleteDocument = async (email) => {
    try {
      return await Model.findOneAndDelete({ email });
    } catch (error) {
      throw new Error(error);
    }
  };
  beforeEach(async () => {
    await connectToDb();
  });
  afterEach(async () => {
    await closeConnectionToBd();
  });

  it("create a new document", async () => {
    const document = await create();
    expect(document.name).toEqual(personData.name);
    expect(document.email).toEqual(personData.email);
    const passWordCorrectlyHashed = await confirmPassword(
      password,
      document.password
    );
    expect(passWordCorrectlyHashed).toBeTruthy();
    await Model.findByIdAndDelete(document._id);
  });
  describe("performs methods after creation", () => {
    let document;
    beforeEach(async () => {
      document = await create();
    });
    afterEach(async () => {
      await deleteDocument(email);
    });
    describe(" static methods for the Model", () => {
      it("finds document by email", async () => {
        const document = await Model.findByEmail(personData.email);
        expect(document.email).toEqual(personData.email);
      });
      it("finds a document matching the email and password", async () => {
        const document = await Model.findOneWithCredentials(
          personData.email,
          personData.password
        );
        expect(document.email).toEqual(personData.email);
        expect(document.name).toEqual(personData.name);
      });
    });
    describe(" instance methods for a document", () => {
      it("resetPasswordTo function reset the document's password", async () => {
        const newPassword = "Smainachez!2345?";
        const document2 = await document.resetPasswordTo(newPassword);
        const passwordChanged = await confirmPassword(
          newPassword,
          document2.password
        );
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
        const document2 = await document.updateNameAndEmail(data);
        expect(document2.email).toEqual(email2);
        expect(document2.name).toEqual(name2);
        await deleteDocument(email2);
      });

      it("getName retrieves the document's name", async () => {
        const name1 = document.getName(name);
        expect(name).toEqual(name1);
      });
      it("getEmail retrieves the document's email", async () => {
        const email1 = document.getEmail(name);
        expect(email).toEqual(email1);
      });
    });
  });
};
