const assert = require("assert");

const {MongoClient} = require("mongodb");
const {SESSION_STORE} = require("../../../config/env");
let db;

exports.clearSessions = async () => {
  try {
    const client = await MongoClient.connect(SESSION_STORE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db("sessions");
    const collection = db.collection("sessions");
    const findSessions = async () => {
      return await collection.find().toArray();
    };
    const allDocs = await findSessions();
    allDocs.forEach(async doc => {
      await collection.findOneAndDelete({_id: doc._id});
    });
    const docAfterCreatin = await findSessions();
    assert.strictEqual(
      docAfterCreatin.length,
      0,
      "Not Able to delete the sessions"
    );
    await client.close();
  } catch (error) {
    throw new Error(error);
  }
};
