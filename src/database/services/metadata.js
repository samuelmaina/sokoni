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
		const adminIds = elem.adminIds;
		if (!adminIds.includes(adminId)) adminIds.push(adminId);
	}
};
exports.removeElement = (field, arr, data) => {
	const updated = arr.filter(cp => {
		return cp[field] !== data;
	});
	return updated;
};
