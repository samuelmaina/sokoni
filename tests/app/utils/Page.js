const {By} = require("selenium-webdriver");
class Page {
  constructor(driver) {
    this.driver = driver;
  }
  async openUrl(url) {
    try {
      await this.driver.get(url);
    } catch (error) {
      throw new Error(error);
    }
  }
  async clickById(id) {
    try {
      await this.driver.findElement(By.id(id)).click();
    } catch (error) {
      throw new Error(error);
    }
  }
  async enterDataByName(name, data) {
    try {
      await this.driver.findElement(By.name(name)).sendKeys(data);
    } catch (error) {
      throw new Error(error);
    }
  }
  async extractTextByClassName(className) {
    try {
      const data = await this.driver
        .findElement(By.className(className))
        .getText();
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
  async hold(ms) {
    try {
      await this.driver.sleep(ms);
    } catch (error) {
      throw new Error(error);
    }
  }
  async getTitle() {
    try {
      const title = await this.driver.getTitle();
      return title;
    } catch (error) {
      throw new Error(error);
    }
  }
  async getError() {
    try {
      const errorMessage = await this.extractTextByClassName("error-message");
      return errorMessage;
    } catch (error) {
      throw new Error(error);
    }
  }
  async getInfo() {
    try {
      const info = await this.extractTextByClassName("info");
      return info;
    } catch (error) {
      throw new Error(error);
    }
  }
  async close() {
    try {
      await this.driver.quit();
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = Page;
