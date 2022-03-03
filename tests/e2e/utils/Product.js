const Page = require('./Page');

class Product {
	constructor(page) {
		this.page = page;
	}
	async enterTitle(data) {
		await this.page.enterTextById('title', data);
	}
	async enterBuyingPrice(data) {
		await this.page.enterDataByName('buyingPrice', data);
	}

	async enterPercentageProfit(data) {
		await this.page.enterDataByName('percentageProfit', data);
	}
	async enterDescription(data) {
		await this.page.enterDataByName('description', data);
	}
	async enterQuantity(data) {
		await this.page.enterDataByName('quantity', data);
	}
	async enterCategory(data) {
		await this.page.enterDataByName('category', data);
	}
	async enterBrand(data) {
		await this.page.enterDataByName('brand', data);
	}
	async chooseFIle(fileUrl) {
		await this.page.enterDataByName('image', fileUrl);
	}
	async submit() {
		await this.page.clickById('submit');
	}
}
module.exports = Product;
