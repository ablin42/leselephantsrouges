import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";
import { createAlertNode, addAlert } from "./utils/alert";

function typeGuardInput(
	toBeDetermined: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
): toBeDetermined is React.ChangeEvent<HTMLInputElement> {
	if ((toBeDetermined as React.ChangeEvent<HTMLInputElement>).type) {
		return true;
	}
	return false;
}

function Resetpw() {
	let [form, setForm] = useState<any>({
		password: "",
		password2: ""
	});

	async function handleInput(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
		let target = e.target;
		let value: string | boolean = target.value.trim();
		if (typeGuardInput(e) && target.type === "checkbox") value = e.target.checked;
		const name = target.name;

		setForm({
			...form,
			[name]: value
		});
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/auth/resetpw", form)
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
			<div className="container container-front">
				<form className="col-md-10 offset-md-1" onSubmit={handleSubmit} id="resetpw" method="POST" action="/api/auth/resetpw">
					<h2 className="square-title text-center mb-5">Reset your password</h2>

					<div className="row">
						<div className="col-md-6 offset-md-3">
							<label className="control-label">
								Password <i className="fa fa-eye ml-2" data-type="showpw" data-showpw="password" aria-hidden="true"></i>
							</label>
							<input
								placeholder="**********"
								onChange={handleInput}
								value={form.password}
								type="password"
								id="password"
								name="password"
								data-vpw="true"
								required
							/>
							<span id="i_password" className="form-info">
								<b>Password</b> must contain between <b>8 and 256 characters</b> and has to be atleast <b>alphanumeric</b>
							</span>
						</div>
						<div className="col-md-6 offset-md-3">
							<label className="control-label">
								Password <i>(confirm)</i>
								<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="password2" aria-hidden="true"></i>
							</label>
							<input
								placeholder="**********"
								onChange={handleInput}
								value={form.password2}
								type="password"
								id="password2"
								data-vpw2="true"
								name="password2"
								required
							/>
							<span id="i_password2" className="form-info">
								<b>Password Confirmation</b> doesn't match <b>password</b>
							</span>
						</div>
						<div className="col-md-6 offset-md-3 mt-3">
							<input type="submit" className="submit-btn" value="Save" id="submit-resetpw" />
						</div>
					</div>
					<input type="hidden" name="tokenId" value="<%= locals.tokenId %>" required />
					<input type="hidden" name="token" value="<%= locals.token %>" required />
					<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
				</form>
			</div>

			<script src="/scripts/core/pwVisibility.js" defer></script>
			<script src="/scripts/core/validation.js" defer></script>
		</>
	);
}

/*

*/

export default Resetpw;
