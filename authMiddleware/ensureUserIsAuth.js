module.exports = (req, res, next) => {
	if (!(req.session && req.session.isUserLoggedIn)) {
		return res.redirect('/auth/user/log-in');
	}
	next();
};
