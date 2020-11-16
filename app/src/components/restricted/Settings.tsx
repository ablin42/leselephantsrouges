import React, { useState, useEffect } from "react";
import axios from "axios";

import "../../main.css";
import { createAlertNode, addAlert } from "../utils/alert";
import { handleInput } from "../utils/inputs";

interface ChangeEmailForm {
	email: string;
}

function ChangeEmail() {
	let [form, setForm] = useState<ChangeEmailForm>({
		email: ""
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/auth/patch/email", form)
			.then(function (response) {
				let alertType = "error";
				if (!response.data.error) alertType = "success";

				let alert = createAlertNode(response.data.message, alertType);
				addAlert(alert, "#alert-wrapper");
			})
			.catch(function (error) {
				let alert = createAlertNode("Une erreur est survenue lors de l'envoi du formulaire", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}

	return (
		<>
			<div className="row">
				<div className="col-md-12">
					<form id="emailform" method="POST" action="/api/user/patch/email" onSubmit={handleSubmit}>
						<label className="control-label">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							onChange={e => handleInput(e, form, setForm)}
							value={form.email}
							data-vemail="true"
							required
						/>
						<span id="i_email" className="form-info">
							<b>E-mail</b> has to be <b>valid</b>
						</span>

						<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
						<input type="submit" className="submit-btn" value="Save" id="submit-emailform" />
					</form>
				</div>
			</div>
		</>
	);
}

interface ChangePasswordForm {
	password: string;
	password2: string;
	cpassword: string;
}

function ChangePassword() {
	let [form, setForm] = useState<ChangePasswordForm>({
		password: "",
		password2: "",
		cpassword: ""
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/auth/patch/password", form)
			.then(function (response) {
				let alertType = "error";
				if (!response.data.error) alertType = "success";

				let alert = createAlertNode(response.data.message, alertType);
				addAlert(alert, "#alert-wrapper");
			})
			.catch(function (error) {
				let alert = createAlertNode("Une erreur est survenue lors de l'envoi du formulaire", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}

	return (
		<>
			<form id="passwordform" className="w-100" method="POST" action="/api/user/patch/password" onSubmit={handleSubmit}>
				<div className="row">
					<div className="col-md-6">
						<label className="control-label">
							Password <i>(current)</i>{" "}
							<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="cpassword" aria-hidden="true"></i>
						</label>
						<input
							type="password"
							name="cpassword"
							id="cpassword"
							placeholder="*********"
							onChange={e => handleInput(e, form, setForm)}
							value={form.cpassword}
							required
						/>
						<span data-placeholder="Current Password"></span>
					</div>

					<div className="col-md-6">
						<label className="control-label">
							Password <i>(new)</i>{" "}
							<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="password" aria-hidden="true"></i>
						</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="*********"
							data-vpw="true"
							onChange={e => handleInput(e, form, setForm)}
							value={form.password}
							required
						/>
						<span id="i_password" className="form-info">
							<b>Password</b> must contain between <b>8 and 256 characters</b> and has to be atleast <b>alphanumeric</b>
						</span>
					</div>
				</div>
				<div className="col-md-12 p-0">
					<label className="control-label">
						Password <i>(confirm)</i>{" "}
						<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="password2" aria-hidden="true"></i>
					</label>
				</div>

				<div className="row">
					<div className="col-md-6">
						<input
							type="password"
							id="password2"
							name="password2"
							placeholder="*********"
							data-vpw2="true"
							onChange={e => handleInput(e, form, setForm)}
							value={form.password2}
							required
						/>
						<span id="i_password2" className="form-info">
							<b>Password Confirmation</b> doesn't match <b>password</b>
						</span>
					</div>
					<div className="col-md-6">
						<input type="submit" className="submit-btn mt-2" value="Save" id="submit-passwordform" />
					</div>
				</div>
			</form>
		</>
	);
}

function Settings() {
	return (
		<>
			<div className="container container-front" id="container-settings">
				<div id="parameters" className="tab col-md-12">
					<div className="col-md-10 offset-md-1 p-2">
						<h1 className="square-title text-center">Settings</h1>
						<div className="settings">
							<ChangeEmail></ChangeEmail>
							<ChangePassword></ChangePassword>
						</div>
					</div>
				</div>
			</div>

			<script src="/scripts/submitUser.js" defer></script>
			<script src="/scripts/core/pwVisibility.js" defer></script>
			<script src="/scripts/core/validation.js" defer></script>
		</>
	);
}

export default Settings;
