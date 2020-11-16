import React, { useState } from "react";
import axios from "axios";

import "../../main.css";
import { addAlert, createAlertNode } from "../utils/alert";

function typeGuardInput(
	toBeDetermined: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
): toBeDetermined is React.ChangeEvent<HTMLInputElement> {
	if ((toBeDetermined as React.ChangeEvent<HTMLInputElement>).type) {
		return true;
	}
	return false;
}

function PostEvent() {
	let [file, setFile] = useState<File | null>(null);
	//any
	let [form, setForm] = useState<any>({
		title: "",
		description: "",
		eventStart: "",
		eventEnd: "",
		address: "",
		url: "",
		price: "",
		staff: ""
	});

	// async function checkErrors(value: string | boolean) {
	// 	let errMsg = "";

	// 	return errMsg;
	// }

	async function handleInput(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
		let target = e.target;
		let value: string | boolean = target.value.trim();
		if (typeGuardInput(e) && target.type === "checkbox") value = e.target.checked;
		const name = target.name;

		setForm({
			...form,
			[name]: value
		});

		//validate input
		//let errorMsg = await checkErrors(value);
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		let formData = new FormData();

		if (file) formData.append("img", file);
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("url", form.url);
		formData.append("address", form.address);
		formData.append("eventStart", form.eventStart);
		formData.append("eventEnd", form.eventEnd);
		formData.append("staff", form.staff);
		formData.append("price", form.price);

		// if (files) {
		// 	let fileExts = ["png", "jpg", "jpeg", "gif"];
		// 	let maxSize = 25000000;

		// 	const dt = new DataTransfer();
		// 	for (let i = 0; i < files.length; i++) {
		// 		const file = files[i];

		// 		let isAllowedExt = fileExts.includes(files[i].name.split(".")[1].toLowerCase());
		// 		if (isAllowedExt && maxSize > files[i].size) dt.items.add(file);

		// 		// toSend = dt.files;
		// 		// setFiles(toSend);
		// 	}
		// }

		console.log(file, form, formData);
		// postEvent({ variables: { files: toSend, title: form.title, description: form.description } }).catch(error =>
		// 	console.log(JSON.stringify(error, null, 2))
		//);

		axios
			.post("/api/events/", {
				body: formData
			})
			.then(function (response) {
				console.log(response);
				// if (!response.data.error) window.location.href = "/link/" + response.data.urlCode;
				// else {
				// 	let alert = createAlertNode(response.data.message, "error");
				// 	addAlert(alert, "#alert-wrapper");
				// }
			})
			.catch(function (error) {
				let alert = createAlertNode("An error occured while processing your request", "error");
				addAlert(alert, "#alert-wrapper");
			});
	}

	return (
		<>
			<h2>Poster un évènement</h2>
			return (
			<form method="POST" id="event" onSubmit={handleSubmit} encType={"multipart/form-data"}>
				<div className="row">
					<h5>Les champs avec un (*) sont obligatoires</h5>
					<label className="control-label">Titre*</label>
					<input
						placeholder="Notre super réal"
						type="text"
						id="title"
						name="title"
						data-vstring="1;256"
						required
						onChange={handleInput}
						value={form.title}
					/>
					<span id="i_title" className="form-info">
						Le <b>titre</b> doit faire entre <b>1 et 256 caractères</b>
					</span>

					<label className="control-label">Description*</label>
					<textarea
						placeholder="La description de notre super réal"
						id="description"
						name="description"
						value={form.description}
						onChange={handleInput}
						data-vstring="1;2048"
						rows={5}
						required
					></textarea>
					<span id="i_description" className="form-info">
						La <b>description</b> doit faire entre <b>1 et 2048 caractères</b>
					</span>

					<label className="control-label">Début de l'événement</label>
					<input type="datetime-local" id="eventStart" name="eventStart" onChange={handleInput} value={form.eventStart} />

					<label className="control-label">Fin de l'événement</label>
					<input type="datetime-local" id="eventEnd" name="eventEnd" onChange={handleInput} value={form.eventEnd} />

					<label className="control-label">Adresse</label>
					<input
						placeholder="12 rue Villedo, 75001, Paris"
						type="text"
						id="address"
						name="address"
						data-vstring="0;512"
						onChange={handleInput}
						value={form.address}
					/>
					<span id="i_address" className="form-info">
						<b>L'addresse</b> ne peut pas faire plus de <b>256 caractères</b>
					</span>

					<label className="control-label">Prix</label>
					<input
						placeholder="35.50 (au centième d'euro près)"
						type="number"
						min="1"
						id="price"
						name="price"
						step=".01"
						onChange={handleInput}
						value={form.price}
					/>

					<label className="control-label">Staff (séparés par un ';')</label>
					<input
						placeholder="Jean Dupont; Mr propre"
						type="text"
						id="staff"
						name="staff"
						onChange={handleInput}
						value={form.staff}
					/>

					<label className="control-label">Lien youtube</label>
					<input
						placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						type="url"
						id="url"
						name="url"
						onChange={handleInput}
						value={form.url}
						data-vurl="true"
					/>
					<span id="i_url" className="form-info">
						Le lien <b>youtube</b> n'est pas au bon <b>format</b>
					</span>

					<h2>img input cover here</h2>

					<input
						name={"document"}
						type={"file"}
						multiple
						onChange={({ target: { files } }) => {
							if (files && files[0]) setFile(files[0]);
						}}
					/>

					<input type="submit" className="submit-btn" value="Ajouter l'événement" id="submit-event" />
				</div>
			</form>
		</>
	);
}

export default PostEvent;
