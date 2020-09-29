const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
let form = document.querySelector("#s3form");

if (form)
	form.addEventListener("submit", function (e) {
		submitForm(e);
	});

async function submitForm(e) {
	e.preventDefault();

	const name = document.querySelector("#username").value;
	const email = document.querySelector("#full-name").value;
	const avatar = document.querySelector("#avatar-url").value;

	let response = await fetch("/save-details", {
		method: "POST",
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify({ name: name, email: email, avatar: avatar })
	});
	response = await response.json();

	if (response.error == true) console.log("handle error here");
	window.location.href = `/account?url=${response.url}`;
}

//let alertType = "success";
//if (response.error === true) alertType = "warning";

//let alert = createAlertNode(response.message, alertType);
//addAlert(alert, "#header");
