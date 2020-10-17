const {By} = require("selenium-webdriver");
const {getNewDriverInstance} = require("../config");
const fs = require("fs");
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
      await this.driver.findElement(By.css(`#${id}`)).click();
    } catch (error) {
      throw new Error(error);
    }
  }
  async clickLink(linkText) {
    try {
      await this.driver.findElement(By.linkText(linkText)).click();
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
      return await this.driver.findElement(By.className(className)).getText();
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
      return await this.driver.getTitle();
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
