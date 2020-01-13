const { validationResult } = require("express-validator");
module.exports=validationErrorsIn=(pathValidatedEarlier)=>{
    const errors = validationResult(pathValidatedEarlier);
    if (!errors.isEmpty()) {
      return errors.array()[0].msg;
    }
}


   