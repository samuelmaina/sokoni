const AdminDb = require('../models/admin');
const UserDb= require("../models/user");
const TokenDb= require('../models/tokenGenerator');

class Auth {
  constructor(Model) {
    this.Model = Model;
  }
  async findOneWithCredentials(email, password) {
    const results = await this.Model.findOneWithCredentials(email, password);
    return results;
  }
  async findByEmail(email) {
    const result = await this.Model.findByEmail(email);
    return result;
  }
  async findById(Id) {
    console.log(this.Model)
    const result = await this.Model.findById(Id);
    return result;
  }
  async createNew(data) {
    const createdResults = await this.Model.createNew(data);
    return createdResults;
  }
  async createTokenForId(Id){
    const token= await TokenDb.createNewForId();
    return token
  }
}

Auth.prototype.findTokenDetails=async function(token){
  const TokenDetails = await TokenDb.findTokenDetails(token);
  return TokenDetails
}

const Admin= new Auth(AdminDb);
const User = new Auth(UserDb);



module.exports={
    Admin,
    User
}