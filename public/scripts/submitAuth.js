let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
let lostpw = document.querySelector("[data-lostpw]");
let log = document.querySelector("[data-sublogin]");
let reg = document.querySelector("[data-subreg]");

if (lostpw)
	lostpw.addEventListener("submit", function (e) {
		submitLostpw(e);
	});

if (log)
	log.addEventListener("submit", function (e) {
		submitLogin(e);
	});

if (reg)
	reg.addEventListener("submit", function (e) {
		submitRegister(e);
	});

async function submitRegister(e) {
	e.preventDefault();

	const email = document.querySelector("#email").value;
	const password = document.querySelector("#password").value;
	const password2 = document.querySelector("#password2").value;

	let response = await fetch("/api/auth/register", {
		method: "POST",
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify({ email: email, password: password, password2: password2 })
	});
	response = await response.json();

	let alertType = "success";
	if (response.error === true) alertType = "warning";
	else {
		document.querySelector("#email").value = "";
		document.querySelector("#password").value = "";
		document.querySelector("#password2").value = "";
	}

	let alert = createAlertNode(response.message, alertType);
	addAlert(alert, "#header");
}

async function submitLogin(e) {
	e.preventDefault();

	const email = document.querySelector("#login-email").value;
	const password = document.querySelector("#login-pw").value;

	let response = await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify({ email: email, password: password })
	});
	response = await response.json();
	if (response.error === false) return (window.location.href = "/Admin");

	let alert = createAlertNode(response.message, "warning");
	addAlert(alert, "#header");
}

async function submitLostpw(e) {
	e.preventDefault();

	const email = document.querySelector("#email-reset").value;

	let response = await fetch("/api/auth/lostpw", {
		method: "POST",
		headers: {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json",
			"CSRF-Token": csrfToken
		},
		body: JSON.stringify({ email: email })
	});
	response = await response.json();
	if (response.error === false) return (window.location.href = "/Auth");

	let alert = createAlertNode(response.message, "warning");
	addAlert(alert, "#header");
}
