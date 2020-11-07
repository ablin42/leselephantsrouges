csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
let form = document.querySelector("#event");
let eventpatch = document.querySelector("#eventpatch");

if (form)
	form.addEventListener("submit", function (e) {
		submitEvent(e);
	});

if (eventpatch)
	eventpatch.addEventListener("submit", function (e) {
		patchEvent(e);
	});

async function submitEvent(e) {
	e.preventDefault();

	const title = document.querySelector("#title").value;
	const description = document.querySelector("#description").value;
	const eventStart = document.querySelector("#eventStart").value;
	const eventEnd = document.querySelector("#eventEnd").value;
	const address = document.querySelector("#address").value;
	const price = document.querySelector("#price").value;
	const staff = document.querySelector("#staff").value;
	const url = document.querySelector("#url").value;
	const img = document.querySelector("#img");
	let formData = new FormData();

	if (img.files[0]) formData.append("img", img.files[0]);
	formData.append("title", title);
	formData.append("description", description);
	formData.append("url", url);
	formData.append("address", address);
	formData.append("eventStart", eventStart);
	formData.append("eventEnd", eventEnd);
	formData.append("staff", staff);
	formData.append("price", price);

	let response = await fetch("/api/events/", {
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
		document.querySelector("#eventStart").value = "";
		document.querySelector("#eventEnd").value = "";
		document.querySelector("#address").value = "";
		document.querySelector("#price").value = "";
		document.querySelector("#staff").value = "";
		document.querySelector("#url").value = "";
	}

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
}

async function patchEvent(e) {
	e.preventDefault();

	const title = document.querySelector("#title").value;
	const description = document.querySelector("#description").value;
	const eventStart = document.querySelector("#eventStart").value;
	const eventEnd = document.querySelector("#eventEnd").value;
	const address = document.querySelector("#address").value;
	const price = document.querySelector("#price").value;
	const staff = document.querySelector("#staff").value;
	const url = document.querySelector("#url").value;
	const img = document.querySelector("#img");
	const id = eventpatch.dataset.eventid;
	let formData = new FormData();

	if (img.files[0]) formData.append("img", img.files[0]);
	formData.append("title", title);
	formData.append("description", description);
	formData.append("url", url);
	formData.append("address", address);
	formData.append("eventStart", eventStart);
	formData.append("eventEnd", eventEnd);
	formData.append("staff", staff);
	formData.append("price", price);

	let response = await fetch(`/api/events/${id}`, {
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
