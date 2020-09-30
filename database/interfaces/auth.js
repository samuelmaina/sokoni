const { Admin, User } = require("../models/index");

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
   * finds a document with the following email
   * @param {String} email
   *
   */
  async findByEmail(email) {
    const result = await this.Model.findByEmail(email);
    return result;
  }
  /**
   *finds a document that with the given id
   * @param {String} Id -a mongoose Id
   */
  async findById(Id) {
    const result = await this.Model.findById(Id);
    return result;
  }
  /**
   *
   * @param {Object} data -an object containing the the document data.
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

Auth.prototype.findTokenDetails = async function (token) {
  const TokenDetails = await TokenDb.findTokenDetails(token);
  return TokenDetails;
};

module.exports = {
  Admin: new Auth(Admin),
  User: new Auth(User),
};
