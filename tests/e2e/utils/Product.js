const Page = require('./Page')

class Products extends Page {
  constructor(driver) {
    this.driver = driver
  }
  async enterTitle(data) {
    await super.enterDataByName("title", data);
  }
  async enterBuyingPrice(data) {
    await super.enterDataByName('buyingPrice', data)
  }
  async pickImage(data) {
    await super.enterTextById('pic', data)
  }
  async enterPercentageProfit(data) {
    await this.enterDataByName('percentageProfit', data)
  }
  async enterDescription(data) {
    await this.enterDataByName('description', data)
  }
  async enterQuantity(data) {
    await this.enterDataByName('quantity', data)
  }
  async enterAdminId(data) {
    await this.enterDataByName('adminId', data)
  }
  async enterCategory(data) {
    await this.enterDataByName('category', data)
  }
  async enterBrand(data) {
    await this.enterDataByName('brand', data)
  }
}
module.exports = Product;