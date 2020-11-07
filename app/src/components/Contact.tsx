import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";

function Contact() {
	return (
		<form className="col-md-10 offset-md-1 mt-4" id="contact" method="POST" action="/api/contact/">
			<div className="row">
				<div className="col-md-6">
					<label className="control-label">Email</label>
					<input placeholder="jeandupont@gmail.com" type="email" name="email" id="email" data-vemail="true" value="" required />
					<span id="i_email" className="form-info">
						L'<b>email</b> doit être <b>valide</b>
					</span>
				</div>
			</div>
			<div className="row">
				<div className="col-md-12">
					<label className="control-label">Objet</label>
					<input
						placeholder="Hey, I found your painting really great..."
						type="text"
						name="title"
						id="title"
						data-vstring="1;256"
						value=""
						required
					/>
					<span id="i_title" className="form-info">
						L'<b>objet</b> doit contenir entre <b>1 et 256 caractères</b>
					</span>
				</div>
				<div className="col-md-12">
					<label className="control-label">Message</label>
					<textarea
						className="mb-0"
						id="content"
						data-vstring="64;2048"
						rows={5}
						name="content"
						placeholder="Votre message ici..."
						required
					></textarea>
					<span id="i_content" className="form-info">
						Le <b>message</b> doit contenir entre <b>64 et 2048 caractères</b>
					</span>
				</div>
			</div>
			<input type="submit" className="submit-btn" value="Send" id="submit-contact" />
			<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
		</form>
	);
}

/*
<% if (locals.formData) { %><%= locals.formData.content %><% } %>
<% if (locals.formData) { %><%= locals.formData.subject %><% } %>
<% if (locals.formData) { %><%= locals.formData.email %><% } %>
*/

export default Contact;
