import React, { useState } from "react";
import "../main.css";
import axios from "axios";
import { createAlertNode, addAlert } from "./utils/alert";
import { typeGuardInput } from "./utils/typeGuards";
import { checkFile, checkFiles, handleInput } from "./utils/inputs";

function Contact() {
	let [form, setForm] = useState<any>({
		email: "",
		title: "",
		content: ""
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/contact", form)
			.then(function (response) {
				let alertType = "error";
				if (!response.data.error) {
					alertType = "success";
					setForm({ email: "", title: "", content: "" });
				}

				let alert = createAlertNode(response.data.message, alertType);
				addAlert(alert, "#alert-wrapper");
			})
			.catch(function (error) {
				let alert = createAlertNode("Une erreur est survenue lors de l'envoi du formulaire", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}

	return (
		<form className="col-md-10 offset-md-1 mt-4" onSubmit={handleSubmit} id="contact" method="POST" action="/api/contact/">
			<div className="row">
				<div className="col-md-6">
					<label className="control-label">Email</label>
					<input
						placeholder="jeandupont@gmail.com"
						type="email"
						name="email"
						onChange={e => handleInput(e, form, setForm)}
						value={form.email}
						id="email"
						data-vemail="true"
						required
					/>
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
						onChange={e => handleInput(e, form, setForm)}
						value={form.title}
						data-vstring="1;256"
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
						onChange={e => handleInput(e, form, setForm)}
						value={form.content}
						placeholder="Votre message ici..."
						required
					></textarea>
					<span id="i_content" className="form-info">
						Le <b>message</b> doit contenir entre <b>64 et 2048 caractères</b>
					</span>
				</div>
			</div>
			<input type="submit" className="submit-btn" value="Send" id="submit-contact" />
		</form>
	);
}

export default Contact;
