exports.addElementIfNonExisting = (arr, element) => {
	const { category, adminId } = element;
	const elementIndex = arr.findIndex(c => {
		return c.category === element.category;
	});
	if (elementIndex < 0) {
		arr.push({
			category: category,
			adminIds: [adminId],
		});
	} else {
		const elem = arr[elementIndex];
		elem.adminIds.push(adminId);
	}
};
