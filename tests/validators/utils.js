const { strictEqual } = require('assert');

const { validationResults } = require('../../utils');

const {
	verifyEqual,
	verifyUndefined,
	verifyTruthy,
} = require('../utils/testsUtils');

const { generateStringSizeN } = require('../utils/generalUtils');

exports.validateStringField = function (field) {
	this.field = field;
	return {
		onField: function (field) {
			this.field = field;
			return this;
		},
		usingValidator: function (validator) {
			this.validator = validator;
			return this;
		},
		withLowerLimitLength: function (lL) {
			this.lL = lL;
			return this;
		},
		withUpperLimitLength: function (uL) {
			this.uL = uL;
			return this;
		},
		withFielNameOnErrrorAs: function (name) {
			this.name = name;
			return this;
		},
		withErrorMessage: function (error) {
			this.error = error;
			return this;
		},
		runTests: function () {
			const field = this.field;
			const validator = this.validator;
			const lLimitLength = this.lL;
			const uLimitLength = this.uL;
			const fieldOnError = this.name;
			const error = this.error;
			it('non-string ', async () => {
				const errorMessage = `${fieldOnError} must be a string.`;
				await generatesErrorWith(validator, field, 123, errorMessage);
			});
			describe(`strings < ${lLimitLength} and > ${uLimitLength} long`, () => {
				const lLMinus1 = lLimitLength - 1;
				it(` < ${lLimitLength}`, async () => {
					const short = generateStringSizeN(lLMinus1);
					strictEqual(short.length, lLMinus1);
					await generatesErrorWith(validator, field, short, error);
				});
				const uLPlus1 = uLimitLength + 1;
				it(`> ${uLimitLength}`, async () => {
					const long = generateStringSizeN(uLPlus1);
					strictEqual(long.length, uLPlus1);
					await generatesErrorWith(validator, field, long, error);
				});
			});
			it('does not generate errors on valid data', async () => {
				const ll = generateStringSizeN(lLimitLength);
				strictEqual(ll.length, lLimitLength);

				const ul = generateStringSizeN(uLimitLength);
				strictEqual(ul.length, uLimitLength);

				const valids = [ll, ul];

				for (const str of valids) {
					await doesNotGenerateErrorWith(validator, field, str);
				}
			});
		},
	};
};

exports.validateFloatField = function (field) {
	this.field = field;
	return {
		onField: function (field) {
			this.field = field;
			return this;
		},
		usingValidator: function (validator) {
			this.validator = validator;
			return this;
		},
		withLowerLimit: function (lL) {
			this.lowerLimit = lL;
			return this;
		},
		withUpperLimit: function (uL) {
			this.upperLimit = uL;
			return this;
		},
		withDelta: function (delta) {
			this.delta = delta;
			return this;
		},
		withFielNameOnErrrorAs: function (name) {
			this.name = name;
			return this;
		},
		withErrorMessageAs: function (error) {
			this.error = error;
			return this;
		},
		runTests: function () {
			commonNumberValidator(
				this.field,
				this.validator,
				this.lowerLimit,
				this.upperLimit,
				this.delta,
				this.name,
				this.error
			);
		},
	};
};
exports.validateIntegerField = function (field) {
	//integers differ at least by
	//1.
	this.delta = 1;
	this.field = field;
	return {
		onField: function (field) {
			this.field = field;
			return this;
		},
		usingValidator: function (validator) {
			this.validator = validator;
			return this;
		},
		withLowerLimit: function (lL) {
			this.lowerLimit = lL;
			return this;
		},
		withUpperLimit: function (uL) {
			this.upperLimit = uL;
			return this;
		},
		withFielNameOnErrrorAs: function (name) {
			this.name = name;
			return this;
		},
		withErrorMessage: function (error) {
			this.error = error;
			return this;
		},
		runTests: function () {
			const field = this.field,
				validator = this.validator,
				upperLimit = this.upperLimit,
				lowerLimit = this.lowerLimit,
				delta = this.delta,
				error = this.error,
				fieldOnError = this.name;
			// first reject floats.
			it('float', async () => {
				const error = `${fieldOnError} must be a whole number.`;
				const decimal = 1.1;
				const body = {};
				body[field] = decimal;
				await ensureGeneratesErrorOnBody(body, validator, error);
			});

			//ints are floats,as such they can be treated as floats.

			commonNumberValidator(
				field,
				validator,
				lowerLimit,
				upperLimit,
				delta,
				fieldOnError,
				error
			);
		},
	};
};

function commonNumberValidator(
	field,
	validator,
	lowerLimit,
	upperLimit,
	delta,
	fieldOnError,
	error
) {
	it('non numeric', async () => {
		const error = `${fieldOnError} must be a number.`;
		await generatesErrorWith(validator, field, 'text', error);
	});
	describe(`< ${lowerLimit} and > ${upperLimit}`, () => {
		it(`< ${lowerLimit}`, async () => {
			await generatesErrorWith(validator, field, lowerLimit - delta, error);
		});
		it(`> ${upperLimit}`, async () => {
			await generatesErrorWith(validator, field, upperLimit + delta, error);
		});
	});
	it('does not generated error on valid data', async () => {
		const valids = [lowerLimit, upperLimit];
		for (const valid of valids) {
			await doesNotGenerateErrorWith(validator, field, valid);
		}
	});
}

async function generatesErrorWith(validator, field, data, errorMessage) {
	const body = {};
	body[field] = data;
	await ensureGeneratesErrorOnBody(body, validator, errorMessage);
}
async function doesNotGenerateErrorWith(validator, field, data) {
	const body = {};
	body[field] = data;
	await ensureDoesNotGenerateErrorOnBody(body, validator);
}

async function ensureGeneratesErrorOnBody(body, validator, error) {
	verifyEqual(await validate(body, validator), error);
}

async function ensureDoesNotGenerateErrorOnBody(body, validator) {
	verifyUndefined(await validate(body, validator));
}

exports.validateMiddlewares = async function (body, validators) {
	expect(await validateMany(body, validators)).not.toBeUndefined();
};

const validateMany = async (body, validators) => {
	const req = mockReq(body);
	const res = mockRes();
	await applyValidationToMany(req, res, validators);
	return validationResults(req);
};
const validate = async (body, validator) => {
	const req = mockReq(body);
	const res = mockRes();
	await applyValidation(req, res, validator);
	return validationResults(req);
};

const mockReq = bodyData => {
	return {
		body: bodyData,
	};
};
const mockRes = () => {
	return {};
};

const applyValidationToMany = async (req, res, validators) => {
	await Promise.all(
		validators.map(async validator => {
			await validator(req, res, () => undefined);
		})
	);
};
const applyValidation = async (req, res, validator) => {
	await validator(req, res, () => undefined);
};

exports.ensureGeneratesErrorOnBody = ensureGeneratesErrorOnBody;
exports.ensureDoesNotGenerateErrorOnBody = ensureDoesNotGenerateErrorOnBody;
