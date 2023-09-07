const requires = require("../../utils/requires");

const { emailSender } = requires.utils;

describe("Email Sender", () => {
  const receiver = "samuelmayna@gmail.com";
  it("should send emails", async () => {
    const body = {
      subject: "Test",
      replyTo: "samuelmayna@gmail.com",
      text: "I am sending an email from sendgrid!",
      to: receiver,
      from: process.env.EMAIL,
    };
    await emailSender(body);
  });
});
