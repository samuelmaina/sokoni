const assert = require('assert');

const { MongoClient } = require('mongodb');
const { SESSION_STORE } = require('../../../config/env');
let db;

exports.clearSessions = async () => {
	try {
		const client = await MongoClient.connect(SESSION_STORE, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		db = client.db('sessions');
		const collection = db.collection('sessions');
		const findSessions = async () => {
			return await collection.find().toArray();
		};
		const allDocs = await findSessions();
		allDocs.forEach(async doc => {
			await collection.findOneAndDelete({ _id: doc._id });
		});
		const docsAfterCreatin = await findSessions();
		assert.strictEqual(
			docsAfterCreatin.length,
			0,
			'Not Able to delete the sessions'
		);
		return new Promise((resolve, reject) => {
			client.close((err, result) => {
				if (err) return reject(err);
				resolve(result);
			});
		});
	} catch (error) {
		throw new Error(error);
	}
};
