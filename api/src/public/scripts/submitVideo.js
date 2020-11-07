csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
let form = document.querySelector("#video");
let videopatch = document.querySelector("#videopatch");

if (form)
	form.addEventListener("submit", function (e) {
		submitVideo(e);
	});

if (videopatch)
	videopatch.addEventListener("submit", function (e) {
		patchVideo(e);
	});

async function submitVideo(e) {
	e.preventDefault();

	const title = document.querySelector("#title").value;
	const description = document.querySelector("#description").value;
	const url = document.querySelector("#url").value;
	const authors = document.querySelector("#authors").value;
	const isFiction = document.querySelector("#isFiction").checked;
	const img = document.querySelector("#img");
	let formData = new FormData();

	formData.append("img", img.files[0]);
	formData.append("title", title);
	formData.append("description", description);
	formData.append("url", url);
	formData.append("authors", authors);
	formData.append("isFiction", isFiction);

	let response = await fetch("/api/videos/", {
		method: "POST",
		mode: "same-origin",
		body: formData,
		headers: {
			"CSRF-Token": csrfToken
		}
	});
	response = await response.json();

	let alertType = "success";
	if (response.error === true) alertType = "warning";
	else {
		document.querySelector("#title").value = "";
		document.querySelector("#description").value = "";
		document.querySelector("#url").value = "";
		document.querySelector("#authors").value = "";
	}

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
}

async function patchVideo(e) {
	e.preventDefault();

	const title = document.querySelector("#title").value;
	const description = document.querySelector("#description").value;
	const url = document.querySelector("#url").value;
	const authors = document.querySelector("#authors").value;
	const isFiction = document.querySelector("#isFiction").checked;
	const img = document.querySelector("#img");
	const id = videopatch.dataset.videoid;
	let formData = new FormData();

	if (img.files[0]) formData.append("img", img.files[0]);
	formData.append("title", title);
	formData.append("description", description);
	formData.append("url", url);
	formData.append("authors", authors);
	formData.append("isFiction", isFiction);

	let response = await fetch(`/api/videos/${id}`, {
		method: "POST",
		mode: "same-origin",
		body: formData,
		headers: {
			"CSRF-Token": csrfToken
		}
	});
	response = await response.json();

	let alertType = "success";
	if (response.error === true) alertType = "warning";

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
}
