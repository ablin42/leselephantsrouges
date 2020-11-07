import React from "react";

import "../../main.css";

function Settings() {
	return (
		<>
			<div className="container container-front" id="container-settings">
				<div id="parameters" className="tab col-md-12">
					<div className="col-md-10 offset-md-1 p-2">
						<h1 className="square-title text-center">Settings</h1>

						<div className="settings">
							<div className="row">
								<div className="col-md-12">
									<form id="emailform" method="POST" action="/api/user/patch/email">
										<label className="control-label">Email</label>
										<input type="email" id="email" name="email" value="" data-vemail="true" required />
										<span id="i_email" className="form-info">
											<b>E-mail</b> has to be <b>valid</b>
										</span>

										<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
										<input type="submit" className="submit-btn" value="Save" id="submit-emailform" />
									</form>
								</div>
							</div>

							<form id="passwordform" className="w-100" method="POST" action="/api/user/patch/password">
								<div className="row">
									<div className="col-md-6">
										<label className="control-label">
											Password <i>(current)</i>{" "}
											<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="cpassword" aria-hidden="true"></i>
										</label>
										<input type="password" name="cpassword" id="cpassword" placeholder="*********" required />
										<span data-placeholder="Current Password"></span>
									</div>

									<div className="col-md-6">
										<label className="control-label">
											Password <i>(new)</i>{" "}
											<i className="fa fa-eye ml-2" data-type="showpw" data-showpw="password" aria-hidden="true"></i>
										</label>
										<input type="password" id="password" name="password" placeholder="*********" data-vpw="true" required />
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
										<input type="password" id="password2" name="password2" placeholder="*********" data-vpw2="true" required />
										<span id="i_password2" className="form-info">
											<b>Password Confirmation</b> doesn't match <b>password</b>
										</span>
									</div>
									<div className="col-md-6">
										<input type="submit" className="submit-btn mt-2" value="Save" id="submit-passwordform" />
									</div>
								</div>
								<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
							</form>
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

/*

<% if (locals.user.email) { %><%= locals.user.email %><% } %>

*/

export default Settings;
