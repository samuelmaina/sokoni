const {
  ensureIsMongooseId,
  ensureIsNonEmptyObject,
  ensureIsPositiveFloat,
  ensureIsPositiveInt,
  ensureStringIsLength,
} = require("../../database/models/utils");

const {generateMongooseId} = require("../utils/generalUtils");

describe.skip("Utils tests", () => {
  let undefined;
  const nullValue = null;
  const text = "text";
  const array = [1, 3];
  const object = {
    name: "object",
  };
  const float = 1;
  it(`ensureIsMongooseId throws when passed non-mongoose ids.`, async () => {
    const errorMessage = "Invalid mongoose Id.";
    const validMongooseId = generateMongooseId();
    expect(() => {
      ensureIsMongooseId(validMongooseId);
    }).not.toThrow();

    const invalidMongooseIds = [object, undefined, nullValue, text, array];
    for (const id of invalidMongooseIds) {
      expect(() => {
        ensureIsMongooseId(id);
      }).toThrow(errorMessage);
    }
  });
  it(`ensureIsNonEmptyObject throws when passed non-objects
      or empty objects`, () => {
    const errorMessage = "Invalid Object";
    const validObject = {
      name: "John Doe",
    };
    expect(() => {
      ensureIsNonEmptyObject(validObject);
    }).not.toThrow();
    const emptyObject = {};
    expect(() => {
      ensureIsNonEmptyObject(emptyObject);
    }).toThrow(errorMessage);
    //Arrays are objects in js
    //but should be rejected
    //in our case.
    const nonObjectData = [array, undefined, nullValue, float, text];
    for (const data of nonObjectData) {
      expect(() => {
        ensureIsNonEmptyObject(data);
      }).toThrow(errorMessage);
    }
  });
  it(`ensureIsPositiveFloat throws when passed non-positive
      floats`, () => {
    const errorMessage = "Value must be positive float.";
    const validPositiveFloat = 1.1;
    expect(() => {
      ensureIsPositiveFloat(validPositiveFloat);
    }).not.toThrow();
    const nonPositiveFloat = 0.0;
    expect(() => {
      ensureIsPositiveFloat(nonPositiveFloat);
    }).toThrow(errorMessage);
    //should not throw when passed
    //positive ints.
    const positiveInteger = 1;
    expect(() => {
      ensureIsPositiveFloat(positiveInteger);
    }).not.toThrow();

    const nonNumericData = [undefined, nullValue, text, array, object];
    for (const data of nonNumericData) {
      expect(() => {
        ensureIsPositiveFloat(data);
      }).toThrow(errorMessage);
    }
  });
  it(`ensureIsPositiveInt throws on non-positive
     ints`, () => {
    const errorMessage = "Value must be positive integer.";
    const validPositiveInt = 1;
    expect(() => {
      ensureIsPositiveInt(validPositiveInt);
    }).not.toThrow();
    const nonPositiveInt = 0;
    expect(() => {
      ensureIsPositiveInt(nonPositiveInt);
    }).toThrow(errorMessage);
    //should throw when passed
    // float.
    let float = 1.1;
    expect(() => {
      ensureIsPositiveInt(float);
    }).toThrow(errorMessage);

    float = 0.8;
    expect(() => {
      ensureIsPositiveInt(float);
    }).toThrow(errorMessage);

    const nonNumericData = [undefined, nullValue, text, array, object];
    for (const data of nonNumericData) {
      expect(() => {
        ensureIsPositiveInt(data);
      }).toThrow(errorMessage);
    }
  });
  it(`ensureStringIsLength throws when length of string
       and  passed length are not equal.`, () => {
    let length = 4;
    const errorMessage = `String must be of length ${length}.`;
    let validString = "test";

    expect(() => {
      ensureStringIsLength(validString, length);
    }).not.toThrow();

    const shorter = "tes";
    expect(() => {
      ensureStringIsLength(shorter, length);
    }).toThrow(errorMessage);

    const longer = "tes";
    expect(() => {
      ensureStringIsLength(longer, length);
    }).toThrow(errorMessage);
    length = 0;
    validString = "";
    expect(() => {
      ensureStringIsLength(validString, length);
    }).not.toThrow();
    const nonString = 4444;
    length = 4;
    expect(() => {
      ensureStringIsLength(nonString, length);
    }).toThrow(errorMessage);
    const invalidLength = -2;
    validString = "text";
    expect(() => {
      ensureStringIsLength(validString, invalidLength);
    }).toThrow("Invalid length.");
  });
});
