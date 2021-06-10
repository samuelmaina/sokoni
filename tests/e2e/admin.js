const { Product } = require("../../database/models");

const { startApp, closeApp, getNewDriverInstance } = require("./config");

const ranges = require("../../config/constraints").product;

const {
    generateStringSizeN
} = require("../utils/generalUtils/utils");
const { verifyEqual, verifyTruthy } = require("../utils/testsUtils");

const {
    clearDb,
    clearModel
} = require("../utils/generalUtils").database
const { Page, session, utilLogin, generalUtils } = require("./utils");
const { ensureHasTitle } = generalUtils;

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = 8080;
const base = `http://localhost:${PORT}`;


const data = {
    name: "John Doe",
    email: "johndoe@email.com",
    password: "JDoe787@?",
};
const logInUrl = `${base}/auth/admin/log-in`;
let page;
describe("Auth", () => {
    beforeAll(async () => {
        await startApp(PORT);
        page = new Page(getNewDriverInstance())
        await utilLogin(page, logInUrl, data, 'admin')
    });
    afterAll(async () => {
        await page.close();
        await clearDb();
        await session.clearSessions()
        await closeApp();
    });
    //reload to after each test


    describe('Add Products', () => {
        beforeEach(async () => {
            const url = `${base}/admin/add-product`;
            await page.openUrl(url);
        });
        afterEach(async () => {
            await clearModel(Product)
        });
    });


    it('should just go to the Your Products page. ', async () => {
        await ensureHasTitle(page, "Your Products")
    });
})
