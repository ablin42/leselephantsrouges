csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
let form = document.querySelector("#video");

if (form)
	form.addEventListener("submit", function (e) {
		submitVideo(e);
	});

async function submitVideo(e) {
	e.preventDefault();

	const title = document.querySelector("#title").value;
	const description = document.querySelector("#description").value;
	const url = document.querySelector("#url").value;
	const authors = document.querySelector("#authors").value;
	const isFiction = document.querySelector("#isFiction").checked;

	console.log({ title, description, url, authors, isFiction });

	let response = await fetch("/api/videos/", {
		method: "POST",
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify({ title, description, url, authors, isFiction })
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
