const MongoClient = require("mongodb").MongoClient;
const {SESSION_STORE} = require("../../../config");
let db;

exports.clearSessions = async () => {
  try {
    const client = await MongoClient.connect(SESSION_STORE);
    db = client.db();
    const collection = db.collection("sessions");
    const findSessions = async () => {
      return await collection.find().toArray();
    };
    const allDocs = await findSessions();
    allDocs.forEach(async doc => {
      await collection.findOneAndDelete({_id: doc._id});
    });
  } catch (error) {
    throw new Error(error);
  }
};
