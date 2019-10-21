module.exports=(req,res,next)=>{
    if(!req.session.isAdmin){
        res.redirect('/admin/login')
    }
    next();
}