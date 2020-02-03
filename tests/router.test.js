const request= require('supertest');
const app =require('../app');
describe('Respond to the /products req',()=>{
    it("responds to the test endpoints", async done => {
      const res = await request(app).get("/products");
      expect(res.body).toHaveProperty("paginationData");
      done();
    });
})