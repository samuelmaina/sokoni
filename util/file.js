const fs=require('fs');

const deletefile=(filepath)=>{
    fs.unlink(filepath,(err)=>{
        if (err){
            return;
        }
    })
}
exports.deletefile=deletefile;