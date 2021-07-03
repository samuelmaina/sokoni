const {
	fileManipulators,
	validationResults,
	Renderer,
	Flash,
} = require('../utils');

const { Product, AdminSales, Metadata } = require('../database/models');

//when admins don't interact with page for
//too long,the session is expired.reading admin._id from it will throw an error.
const returnAdminIdIfAdminIsInSession = req => {
	if (req.session && req.session.admin) return req.session.admin._id;
	return null;
};

exports.getAddProduct = (req, res, next) => {
	new Renderer(res)
		.templatePath('admin/edit-product')
		.pageTitle('Add Product')
		.pathToPost('/admin/add-product')
		.activePath('/add-product')
		.appendDataToResBody({ editing: false })
		.render();
};

exports.postAddProduct = async (req, res, next) => {
	try {
		const flash = new Flash(req, res).appendPreviousData(req.body);
		let image = req.file;
		const validationErrors = validationResults(req);

		if (!image) {
			return flash
				.appendError('Please select an image for your product')
				.redirect('add-product');
		}
		if (validationErrors) {
			return flash.appendError(validationErrors).redirect('add-product');
		}

		const productData = req.body;
		productData.imageUrl = image.path;
		productData.adminId = returnAdminIdIfAdminIsInSession(req);
		await Product.createOne(productData);
		flash.appendInfo('Product added successfully.').redirect('/admin/products');
	} catch (error) {
		next(error);
	}
};

exports.getEditProduct = async (req, res, next) => {
	try {
		const flash = new Flash(req, res);
		const adminId = returnAdminIdIfAdminIsInSession(req);
		const { edit, page } = req.query;

		const prodId = req.params.id;
		const product = await Product.findById(prodId);

		if (!product || !product.isCreatedByAdminId(adminId)) {
			return flash
				.appendError('Product not there or you are not authorised to modify it')
				.redirect('/admin/products');
		}
		new Renderer(res)
			.templatePath('admin/edit-product')
			.pageTitle('Edit Product')
			.pathToPost('/admin/edit-product')
			.activePath('/products')
			.appendPreviousData(product)
			.appendDataToResBody({
				editing: edit,
				page,
			})
			.render();
	} catch (error) {
		next(error);
	}
};

exports.postEditProduct = async (req, res, next) => {
	try {
		const { page, id } = req.body;
		const editMode = true;
		let image = req.file;

		const renderer = new Renderer(res)
			.templatePath('admin/edit-product')
			.pageTitle('Edit Product')
			.pathToPost('/admin/edit-product')
			.activePath('/products')
			.appendPreviousData(req.body)
			.appendDataToResBody({
				editing: editMode,
				page,
			});
		const productData = req.body;

		const adminId = returnAdminIdIfAdminIsInSession(req);
		if (image) {
			productData.imageUrl = image.path;
		}
		const validationErrors = validationResults(req);
		if (validationErrors) {
			return renderer.appendError(validationErrors).render();
		}
		const product = await Product.findById(id);
		if (!product || !product.isCreatedByAdminId(adminId)) {
			return renderer
				.appendError(
					'Product is not there or you are not not allowed to modify it'
				)
				.render();
		}

		await product.updateDetails(productData);

		new Flash(req, res)
			.appendInfo('Product updated successfully.')
			.redirect(`/admin/products?page=${page}`);
	} catch (error) {
		next(error);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const { findCategoriesForAdminId } = Product;
		const renderer = new Renderer(res);
		const adminId = returnAdminIdIfAdminIsInSession(req);
		const page = +req.query.page || 1;
		const categories = await Product.findCategoriesForAdminId(adminId);
		const { paginationData, products } =
			await Product.findPageProductsForAdminId(adminId, page);
		renderer
			.templatePath('admin/products')
			.pageTitle('Your Products')
			.activePath('/admin/products')
			.activePath('/products')
			.appendDataToResBody({
				prods: products,
				categories,
				paginationData,
			})
			.render();
	} catch (error) {
		next(error);
	}
};

exports.getCategoryProducts = async (req, res, next) => {
	try {
		const { findCategoryProductsForAdminIdAndPage, findCategoriesForAdminId } =
			Product;
		const renderer = new Renderer(res);
		const adminId = returnAdminIdIfAdminIsInSession(req);
		let { page } = req.query;
		const category = req.params.category;
		page = +page || 1;
		const { paginationData, products } =
			await Product.findCategoryProductsForAdminIdAndPage(
				adminId,
				category,
				page
			);
		const categories = await findCategoriesForAdminId(adminId);
		renderer
			.templatePath('admin/products')
			.pageTitle(`${category}`)
			.activePath('/admin/products')
			.activePath('/products')
			.appendDataToResBody({
				prods: products,
				categories,
				paginationData,
			})
			.render();
	} catch (error) {
		next(error);
	}
};

exports.deleteProduct = async (req, res, next) => {
	try {
		const flash = new Flash(req, res);
		const adminId = returnAdminIdIfAdminIsInSession(req);
		const prodId = req.params.id;
		const prod = await Product.findById(prodId);
		if (!prod || !prod.isCreatedByAdminId(adminId)) {
			return flash
				.appendError("You can't delete this product")
				.redirect('/admin/products');
		}
		fileManipulators.deleteFile(prod.imageUrl);
		await Product.findByIdAndRemove(prodId);
		flash
			.appendInfo('Product deleted successfully')
			.redirect('/admin/products');
	} catch (error) {
		next(error);
	}
};

exports.getAdminSales = async (req, res, next) => {
	try {
		const renderer = new Renderer(res);
		const adminId = returnAdminIdIfAdminIsInSession(req);
		const salesProfits =
			await AdminSales.findOneForAdminIdAndPopulateProductsData(adminId);

		renderer
			.templatePath('admin/sales')
			.pageTitle('Your Sales')
			.activePath('/sales')
			.appendDataToResBody({
				sales: salesProfits,
			})
			.render();
	} catch (error) {
		next(error);
	}
};
