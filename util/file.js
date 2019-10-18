const fs=require('fs');

const deletefile=(filepath)=>{
    fs.unlink(filepath,(err)=>{
        if (err){
            throw err;
        }
    })
}
exports.deletefile=deletefile;