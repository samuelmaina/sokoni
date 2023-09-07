const bcrypt = require("bcrypt");

const requires= require("../../utils/requires");


const { baseServices } = requires.services;

const { hashPassword, confirmPassword } = baseServices;

const password = "password";
const saltRounds = 12;

describe("base services", () => {
  it("hashPassword should hash password", async () => {
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
    // bycrypt will only return true if the first parameter is the
    //hash of the second. It will return false even if the two password are the same plain text.
    //Hence this can be used to ensure that the password is hashed correctly.
    expect(await bcrypt.compare(password, hash)).toBeTruthy();
  });
  it("confirmPassword should confirm a hashed password", async () => {
    const hash = await bcrypt.hash(password, saltRounds);
    expect(await confirmPassword(password, hash)).toBeTruthy();
  });
});
