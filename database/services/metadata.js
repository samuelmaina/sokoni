exports.addElementIfNonExisting = (field, arr, element) => {
	const { adminId } = element;
	const typeData = element[field];
	const elementIndex = arr.findIndex(c => {
		return c[field] === typeData;
	});
	if (elementIndex < 0) {
		const object = {};
		object[field] = typeData;
		object.adminIds = [adminId];
		arr.push(object);
	} else {
		const elem = arr[elementIndex];
		elem.adminIds.push(adminId);
	}
};
