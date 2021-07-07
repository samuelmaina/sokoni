const { check } = require('express-validator');

exports.stringValidator = (field, minlength, maxlength, err) => {
	return check(field)
		.isString()
		.withMessage(err)
		.isLength({ min: minlength, max: maxlength })
		.withMessage(err);
};
