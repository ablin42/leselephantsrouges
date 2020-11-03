const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

let emailform = document.querySelector("#emailform");
if (emailform)
	emailform.addEventListener("submit", function (e) {
		patchEmail(event);
	});

let passwordform = document.querySelector("#passwordform");
if (passwordform)
	passwordform.addEventListener("submit", function (e) {
		patchPassword(event);
	});

async function patchEmail(e) {
	e.preventDefault();

	let obj = {
		email: document.querySelector("#email").value
	};

	let response = await fetch(`/api/auth/patch/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify(obj),
		credentials: "include",
		mode: "same-origin"
	});
	response = await response.json();

	let alertType = "success";
	if (response.error === true) alertType = "warning";

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
	return;
}

async function patchPassword(e) {
	e.preventDefault();

	let obj = {
		cpassword: document.querySelector("#cpassword").value,
		password: document.querySelector("#password").value,
		password2: document.querySelector("#password2").value
	};

	let response = await fetch(`/api/auth/patch/password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify(obj),
		credentials: "include",
		mode: "same-origin"
	});
	response = await response.json();

	let alertType = "success";
	if (response.error === true) alertType = "warning";

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
	return;
}
