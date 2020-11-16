import React, { useState } from "react";
//import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";
import { createAlertNode, addAlert } from "./utils/alert";
import { typeGuardInput } from "./utils/typeGuards";
import { checkFile, checkFiles, handleInput } from "./utils/inputs";

function Login() {
	let [form, setForm] = useState<any>({
		email: "",
		password: ""
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/auth/login", form)
			.then(function (response) {
				if (!response.data.error) window.location.href = "/Admin/";
				else {
					let alert = createAlertNode(response.data.message, "error");
					addAlert(alert, "#alert-wrapper");
				}
			})
			.catch(function (error) {
				let alert = createAlertNode("Une erreur est survenue lors du log in", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}

	return (
		<>
			<div className="container container-front" id="container-login">
				<h1 className="square-title text-center">Log in</h1>

				<form
					className="col-md-6 offset-md-3 text-center"
					id="login-form"
					onSubmit={handleSubmit}
					method="POST"
					data-sublogin="true"
					action="/api/auth/login"
				>
					<div className="row">
						<label className="control-label">Email</label>
						<input
							placeholder="Email"
							type="email"
							id="login-email"
							name="email"
							onChange={e => handleInput(e, form, setForm)}
							value={form.email}
							required
						/>

						<label className="control-label">
							Password <i className="fa fa-eye ml-2" data-type="showpw" data-showpw="login-pw" aria-hidden="true"></i>
						</label>
						<input
							placeholder="Password"
							type="password"
							id="login-pw"
							name="password"
							onChange={e => handleInput(e, form, setForm)}
							value={form.password}
							required
						/>

						<input type="submit" className="submit-btn" value="Log in" id="submit-login" />
					</div>
				</form>
			</div>
		</>
	);
}

function Recovery() {
	let [form, setForm] = useState<any>({
		email: "",
		password: ""
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/auth/lostpw", form)
			.then(function (response) {
				let alertType = "error";
				if (!response.data.error) alertType = "success";

				let alert = createAlertNode(response.data.message, alertType);
				addAlert(alert, "#alert-wrapper");
			})
			.catch(function (error) {
				let alert = createAlertNode("Une erreur est survenue lors du log in", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}
	return (
		<>
			<div className="container container-front" id="container-lostpw">
				<h1 className="square-title text-center">Password Recovery</h1>

				<form
					className="col-md-6 offset-md-3 text-center"
					id="lostpw"
					onSubmit={handleSubmit}
					data-lostpw="true"
					method="POST"
					action="/api/auth/lostpw"
				>
					<div className="row">
						<div className="alert alert-warning alert-static w-100" role="alert">
							We'll send you a mail with instructions to reset your password
						</div>
						<label className="control-label">Email</label>
						<input
							placeholder="youremail@gmail.com"
							type="email"
							id="email-reset"
							name="email"
							onChange={e => handleInput(e, form, setForm)}
							value={form.email}
							data-vemail="true"
							required
						/>
						<span id="i_email-reset" className="form-info">
							<b>E-mail</b> has to be <b>valid</b>
						</span>
						<input type="submit" className="submit-btn" value="Send" id="submit-lostpw" />
					</div>
				</form>
			</div>
		</>
	);
}

function Auth() {
	return (
		<>
			<Login></Login>
			<Recovery></Recovery>
			<script src="/scripts/core/pwVisibility.js" defer></script>
			<script src="/scripts/submitAuth.js" defer></script>
			<script src="/scripts/core/validation.js" defer></script>
		</>
	);
}

/*
<% if (locals.formData) { %><%= locals.formData.email %><% } %>
	<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />

*/

export default Auth;
