exports.addElementIfNonExisting = (arr, element) => {
	const elementIndex = arr.findIndex(c => {
		return c === element;
	});
	if (elementIndex < 0) {
		arr.push(element);
	}
};
