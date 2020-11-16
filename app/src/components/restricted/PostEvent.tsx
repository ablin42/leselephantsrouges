import React, { useState } from "react";
import axios from "axios";

import "../../main.css";
import { addAlert, createAlertNode } from "../utils/alert";
import { checkFile, checkFiles, handleInput } from "../utils/inputs";

// async function checkErrors(value: string | boolean) {
// 	let errMsg = "";

// 	return errMsg;
// }

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

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		let formData = new FormData();
		let fileError = checkFile(file);

		if (fileError) {
			let alert = createAlertNode(fileError, "error");
			addAlert(alert, "#alert-wrapper");

			return;
		}

		if (file) formData.append("img", file);
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("url", form.url);
		formData.append("address", form.address);
		formData.append("eventStart", form.eventStart);
		formData.append("eventEnd", form.eventEnd);
		formData.append("staff", form.staff);
		formData.append("price", form.price);

		axios
			.post("/api/events/", {
				body: formData
			})
			.then(function (response) {
				if (!response.data.error) window.location.href = "/";
				else {
					let alert = createAlertNode(response.data.message, "error");
					addAlert(alert, "#alert-wrapper");
				}
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
						onChange={e => handleInput(e, form, setForm)}
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
						onChange={e => handleInput(e, form, setForm)}
						data-vstring="1;2048"
						rows={5}
						required
					></textarea>
					<span id="i_description" className="form-info">
						La <b>description</b> doit faire entre <b>1 et 2048 caractères</b>
					</span>

					<label className="control-label">Début de l'événement</label>
					<input
						type="datetime-local"
						id="eventStart"
						name="eventStart"
						onChange={e => handleInput(e, form, setForm)}
						value={form.eventStart}
					/>

					<label className="control-label">Fin de l'événement</label>
					<input
						type="datetime-local"
						id="eventEnd"
						name="eventEnd"
						onChange={e => handleInput(e, form, setForm)}
						value={form.eventEnd}
					/>

					<label className="control-label">Adresse</label>
					<input
						placeholder="12 rue Villedo, 75001, Paris"
						type="text"
						id="address"
						name="address"
						data-vstring="0;512"
						onChange={e => handleInput(e, form, setForm)}
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
						onChange={e => handleInput(e, form, setForm)}
						value={form.price}
					/>

					<label className="control-label">Staff (séparés par un ';')</label>
					<input
						placeholder="Jean Dupont; Mr propre"
						type="text"
						id="staff"
						name="staff"
						onChange={e => handleInput(e, form, setForm)}
						value={form.staff}
					/>

					<label className="control-label">Lien youtube</label>
					<input
						placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						type="url"
						id="url"
						name="url"
						onChange={e => handleInput(e, form, setForm)}
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
