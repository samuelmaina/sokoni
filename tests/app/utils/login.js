module.exports = login = async (page, loginUrl, data, type) => {
  try {
    switch (type) {
      case "user":
        await createNewUserWithData(data);
        break;
      case "admin":
        await createNewAdminWithData(data);
        break;
      default:
        break;
    }
    await page.openUrl(loginUrl);
    await page.enterEmail(data.email);
    await page.enterPassword(data.password);
    await page.submit("login");
  } catch (error) {
    throw new Error(error);
  }
};
