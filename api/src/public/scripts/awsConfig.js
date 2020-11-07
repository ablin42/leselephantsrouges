(() => {
	document.getElementById("file-input").onchange = () => {
		const files = document.getElementById("file-input").files;
		const file = files[0];
		if (file == null) {
			return alert("No file selected.");
		}
		getSignedRequest(file);
	};
})();

async function getSignedRequest(file) {
	let response = await fetch(`/sign-s3?file-name=${file.name}&file-type=${file.type}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"CSRF-Token": csrfToken
		},
		credentials: "include",
		mode: "same-origin"
	});
	response = await response.json();

	if (response.error == true) {
		console.log("handle error here");
		return;
	}
	uploadFile(file, response.data.signedRequest, response.data.url);
}

async function uploadFile(file, signedRequest, url) {
	let response = await fetch(signedRequest, {
		method: "PUT",
		body: file
	});
	console.log(response);

	if (response.status != 200 || response.ok != true) {
		console.log("Could not upload file."); // handle error here
		return;
	}
	document.getElementById("preview").src = url;
	document.getElementById("avatar-url").value = url;
}
