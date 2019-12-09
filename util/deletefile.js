const fs=require('fs');

const deletefile=(filepath)=>{
    fs.unlink(filepath,(err)=>{
        if (err){
            return;
        }
    })
}
module.exports=deletefile;