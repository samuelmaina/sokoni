// const { validateStringField, validateFloatField } = require('./utils');

// const { accounting } = require('../../validators');

// const ranges = require('../../config/constraints').accounting;
// const { validateAmount, validatePaymentMethod, paymentValidators } = accounting;

// describe.skip('Accounting validators', () => {
// 	describe('Amount', () => {
// 		const { min, max, error } = ranges.amount,
// 			delta = 0.01;
// 		validateFloatField()
// 			.onField('amount')
// 			.usingValidator(validateAmount)
// 			.withLowerLimit(min)
// 			.withUpperLimit(max)
// 			.withDelta(delta)
// 			.withFielNameOnErrrorAs('Amount')
// 			.withErrorMessageAs(error)
// 			.runTests();
// 	});
// 	describe('Payment Method', () => {
// 		const { minlength, maxlength, error } = ranges.paymentMethod;
// 		validateStringField()
// 			.onField('paymentMethod')
// 			.usingValidator(validatePaymentMethod)
// 			.withLowerLimitLength(minlength)
// 			.withUpperLimitLength(maxlength)
// 			.withFielNameOnErrrorAs('Payment method')
// 			.withErrorMessage(error)
// 			.runTests();
// 	});
// });
