module.exports=(err,errfunction)=>{
   const error = new Error(err);
      error.httpStatusCode = 500;//to handle all the server-related errors hence the status code of 500
      return errfunction(error);
}