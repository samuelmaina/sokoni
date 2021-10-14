const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

exports.hashPassword = async plain => {
	return await bcrypt.hash(plain, SALT_ROUNDS);
};

exports.confirmPassword = async (plain, hash) => {
	return await bcrypt.compare(plain, hash);
};
