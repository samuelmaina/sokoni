const AdminDb = require('../models/admin');
const UserDb= require("../models/user");
const TokenDb= require('../models/tokenGenerator');

class Auth {
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * returns the documents with both the cridentials email and password
   * @param {String} email 
   * @param {String} password 
   */
  async findOneWithCredentials(email, password) {
    const results = await this.Model.findOneWithCredentials(email, password);
    return results;
  }
  /**
   * find a document with the following email
   * @param {String} email -the email to be searched
   * 
   */
  async findByEmail(email) {
    const result = await this.Model.findByEmail(email);
    return result;
  }
  /**
   *find a document that with the given id
   * @param {String} Id -a mongoose Id
   */
  async findById(Id) {
    const result = await this.Model.findById(Id);
    return result;
  }
  /**
   *
   * @param {Object} data -the object data to be created
   * The function creates a new document
   */
  async createNew(data) {
    const createdResults = await this.Model.createNew(data);
    return createdResults;
  }
  async createTokenForId(Id) {
    const token = await TokenDb.createNewForId(Id);
    return token;
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