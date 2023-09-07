const { smsSender } = require("../utils/requires").utils;

describe("Tests for the sms sender", () => {
  it("should be able to send for the correct sms and  number", async () => {
    const to = "+254711516786";
    const message = "Testing that sms messages can be sent.";
    await smsSender(message, to);
  });
});
