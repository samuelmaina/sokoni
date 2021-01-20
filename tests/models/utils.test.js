const {
  verifyThrowsError,
  verifyDoesNotThrowError,
} = require("../utils/testsUtils");

const {
  ensureIsMongooseId,
  ensureIsNonEmptyObject,
  ensureIsPositiveFloat,
  ensureIsPositiveInt,
  ensureStringIsLength,
  throwErrorIfStringLengthNotInRange,
} = require("../../database/models/utils");

const {generateMongooseId} = require("../utils/generalUtils");

describe.skip("--Utils", () => {
  let undefined;
  const nullValue = null;
  const text = "text";
  const array = [1, 3];
  const object = {
    name: "object",
  };
  const float = 1.2;
  it("throwErrorIfStringLengthNotInRange", () => {
    let error, min, max;
    min = 4;
    max = 7;
    error = `string must be ${min} to ${max} characters long.`;
    //throw on invalid
    for (const invalid of [12345, "tes", "longtest"]) {
      verifyThrowsError(() => {
        throwErrorIfStringLengthNotInRange(invalid, min, max, error);
      }, error);
    }
    //does not throw on valids.
    for (const valid of ["test", "test12"]) {
      verifyDoesNotThrowError(() => {
        throwErrorIfStringLengthNotInRange(valid, min, max, error);
      });
    }
  });
  it(`ensureIsMongooseId throws when passed non-mongoose ids.`, async () => {
    const errorMessage = "Id is not a valid mongoose id.";
    const validMongooseId = generateMongooseId();
    verifyDoesNotThrowError(() => {
      ensureIsMongooseId(validMongooseId, errorMessage);
    }, errorMessage);

    const invalids = [object, undefined, nullValue, text, array];
    for (const id of invalids) {
      verifyThrowsError(() => {
        ensureIsMongooseId(id);
      }, errorMessage);
    }
  });
  it(`ensureIsNonEmptyObject throws when passed non-objects
      or empty objects`, () => {
    const errorMessage = "Invalid Object";
    const validObject = {
      name: "John Doe",
    };
    verifyDoesNotThrowError(() => {
      ensureIsNonEmptyObject(validObject);
    });
    const emptyObject = {};
    verifyThrowsError(() => {
      ensureIsNonEmptyObject(emptyObject);
    }, errorMessage);
    //Arrays are objects in js
    //but should be rejected
    //in our case.
    const nonObjectData = [array, undefined, nullValue, float, text];
    for (const data of nonObjectData) {
      verifyThrowsError(() => {
        ensureIsNonEmptyObject(data);
      }, errorMessage);
    }
  });
  it(`ensureIsPositiveFloat throws when passed non-positive
      floats`, () => {
    const errorMessage = `Value must be positive float.`;
    const validPositiveFloat = 1.1;
    verifyDoesNotThrowError(() => {
      ensureIsPositiveFloat(validPositiveFloat);
    });
    const nonPositiveFloat = 0.0;

    verifyThrowsError(() => {
      ensureIsPositiveFloat(nonPositiveFloat);
    }, errorMessage);

    //should not throw when passed
    //positive ints.
    const positiveInteger = 1;

    verifyDoesNotThrowError(() => {
      ensureIsPositiveFloat(positiveInteger);
    });

    const nonNumericData = [undefined, nullValue, text, array, object];
    for (const data of nonNumericData) {
      verifyThrowsError(() => {
        ensureIsPositiveFloat(data);
      }, errorMessage);
    }
  });
  it(`ensureIsPositiveInt throws on non-positive
     ints`, () => {
    const errorMessage = "Value must be positive integer.";
    const validPositiveInt = 1;
    verifyDoesNotThrowError(() => {
      ensureIsPositiveInt(validPositiveInt);
    });
    const nonPositiveInt = 0;
    verifyThrowsError(() => {
      ensureIsPositiveInt(nonPositiveInt);
    }, errorMessage);

    //should throw when passed
    // float.
    let float = 1.1;
    verifyThrowsError(() => {
      ensureIsPositiveInt(float);
    }, errorMessage);

    const nonNumericData = [undefined, nullValue, text, array, object];
    for (const data of nonNumericData) {
      verifyThrowsError(() => {
        ensureIsPositiveInt(data);
      }, errorMessage);
    }
  });
  it(`ensureStringIsLength throws when length of string
       and  passed length are not equal.`, () => {
    let length = 4;
    const errorMessage = `String must be of length ${length}.`;
    let validString = "test";
    verifyDoesNotThrowError(() => {
      ensureStringIsLength(validString, length);
    });

    const shorter = "tes";
    verifyThrowsError(() => {
      ensureStringIsLength(shorter, length);
    }, errorMessage);

    const longer = "tes";
    verifyThrowsError(() => {
      ensureStringIsLength(longer, length);
    }, errorMessage);
    length = 0;
    validString = "";
    verifyDoesNotThrowError(() => {
      ensureStringIsLength(validString, length);
    });
    const nonString = 4444;
    length = 4;
    verifyThrowsError(() => {
      ensureStringIsLength(nonString, length);
    }, errorMessage);
    const invalidLength = -2;
    validString = "text";
    verifyThrowsError(() => {
      ensureStringIsLength(validString, invalidLength);
    }, "Invalid length.");
  });
});
