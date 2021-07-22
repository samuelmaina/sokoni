const btn = document.getElementsByClassName('delete')[0];
console.log(btn);

btn.addEventListener('click', event => {
	event.preventDefault();
	request(btn);
});

function request(btn) {
	const prodId = btn.parentNode.querySelector('[name=id]').value;
	const csurf = btn.parentNode.querySelector('[name=_csrf]').value;
	const productElement = btn.closest('article');
	fetch('/admin/product/' + prodId, {
		method: 'DELETE',
		headers: {
			'csrf-token': csurf,
		},
	})
		.then(result => console.log(result))
		.then(data => {
			productElement.parentNode.removeChild(productElement);
		})
		.catch(err => console.log('This is the error,' + err))
		//the code is throwing ssl error since the delete method is not carried in production.
		//I added finally to make this work(the worst to go for a solution)
		//TODOs: remove the ssl error
		.finally(() => {
			productElement.parentNode.removeChild(productElement);
		});
}
