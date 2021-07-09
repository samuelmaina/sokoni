const { validationResults } = require('../../utils');
const {
	intValidator,
	stringValidator,
	floatValidator,
	mongoIdValidator,
} = require('../../validators/utils');
const { ranges } = require('../models/utils');
const {
	generateStringSizeN,
	generateMongooseId,
} = require('../utils/generalUtils/utils');
const { verifyEqual, verifyUndefined } = require('../utils/testsUtils');

describe('Test for base validator', () => {
	describe('Int Validator', () => {
		const field = 'example',
			min = 1,
			max = 10,
			err = `The value is supposed to range from  ${min} to ${max} `;
		runRejectionTest('reject for smaller value', min - 1);
		runRejectionTest('reject for larger value', max + 1);
		it('when value value is not an int', async () => {
			const body = {};
			body[field] = 2.5;
			const err = `${field} must be a whole number.`;
			await ensureGeneratesErrorForPart(
				body,
				field,
				intValidator,
				min,
				max,
				err
			);
		});
		describe('should not reject for valid values', () => {
			runAcceptanceTest('min', min);
			runAcceptanceTest('max', max);
		});

		function runRejectionTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = value;
				await ensureGeneratesErrorForPart(
					body,
					field,
					intValidator,
					min,
					max,
					err
				);
			});
		}
		function runAcceptanceTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = value;
				await ensureDoesNotGeneratesErrorOnPart(
					body,
					field,
					intValidator,
					min,
					max,
					err
				);
			});
		}
	});
	describe('string validator', () => {
		const field = 'example',
			minlength = 1,
			maxlength = 10,
			err = `The value is supposed to range from  ${minlength} to ${maxlength} `;
		runRejectionTest('reject for smaller value', minlength - 1);
		runRejectionTest('reject for larger value', maxlength + 1);
		it('reject when value is not a string', async () => {
			const body = {};
			body[field] = 1;
			const err = `${field} must be a string.`;
			await ensureGeneratesErrorForPart(
				body,
				field,
				stringValidator,
				minlength,
				maxlength,
				err
			);
		});
		describe('should not reject for valid values', () => {
			runAcceptanceTest('minlength', minlength);
			runAcceptanceTest('maxlength', maxlength);
		});

		function runRejectionTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = generateStringSizeN(value);
				await ensureGeneratesErrorForPart(
					body,
					field,
					stringValidator,
					minlength,
					maxlength,
					err
				);
			});
		}
		function runAcceptanceTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = generateStringSizeN(value);
				await ensureDoesNotGeneratesErrorOnPart(
					body,
					field,
					stringValidator,
					minlength,
					maxlength,
					err
				);
			});
		}
	});

	describe('float validator', () => {
		const field = 'example',
			min = 1.25,
			max = 9.25,
			err = `The value is supposed to range from  ${min} to ${max} `;
		runRejectionTest('reject for smaller value', min - 1);
		runRejectionTest('reject for larger value', max + 1);
		it('when value value is not a float', async () => {
			const body = {};
			body[field] = 'string';
			const err = `${field} must be a number.`;

			await ensureGeneratesErrorForPart(
				body,
				field,
				floatValidator,
				min,
				max,
				err
			);
		});
		describe('should not reject for valid values', () => {
			runAcceptanceTest('min', min);
			runAcceptanceTest('max', max);
		});

		function runRejectionTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = value;
				await ensureGeneratesErrorForPart(
					body,
					field,
					floatValidator,
					min,
					max,
					err
				);
			});
		}
		function runAcceptanceTest(testDescription, value) {
			it(testDescription, async () => {
				const body = {};
				body[field] = value;
				await ensureDoesNotGeneratesErrorOnPart(
					body,
					field,
					floatValidator,
					min,
					max,
					err
				);
			});
		}
	});
	describe('mongoId validator', () => {
		const field = 'example',
			err = `The value should be a mongo Id `;
		runRejectionTest(
			'reject invalid ids ',
			generateStringSizeN(ranges.mongooseId.exact)
		);
		runAcceptanceTest('accepts valid id', generateMongooseId());

		function runRejectionTest(testDescription, value) {
			it(testDescription, async () => {
				const req = await implementValidation(value);
				verifyEqual(await validationResults(req), err);
			});
		}
		function runAcceptanceTest(testDescription, value) {
			it(testDescription, async () => {
				const req = await implementValidation(value);
				verifyUndefined(await validationResults(req));
			});
		}

		async function implementValidation(value) {
			const body = {};
			body[field] = value;
			const req = mockReq(body);
			const res = mockRes();
			const validatorImp = mongoIdValidator(field, err);
			await validatorImp(req, res, () => undefined);
			return req;
		}
	});
});

async function ensureGeneratesErrorForPart(
	part,
	field,
	validator,
	min,
	max,
	err
) {
	const req = await implementValidation(part, field, validator, min, max, err);
	verifyEqual(await validationResults(req), err);
}

async function ensureDoesNotGeneratesErrorOnPart(
	part,
	field,
	validator,
	min,
	max,
	err
) {
	const req = await implementValidation(part, field, validator, min, max, err);
	verifyUndefined(await validationResults(req));
}

async function implementValidation(part, field, validator, min, max, err) {
	const req = mockReq(part);
	const res = mockRes();
	await applyValidation(req, res, field, min, max, validator, err);
	return req;
}

const mockReq = bodyData => {
	return {
		body: bodyData,
	};
};
const mockRes = () => {
	return {};
};

const applyValidation = async (req, res, field, min, max, validator, err) => {
	const validatorImp = validator(field, min, max, err);
	await validatorImp(req, res, () => undefined);
};
