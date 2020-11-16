import React, { useState, useEffect } from "react";
import "../../main.css";
import axios from "axios";
import { createAlertNode, addAlert } from "../utils/alert";
import { checkFile, checkFiles, handleInput } from "../utils/inputs";

function PatchEvent() {
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

		//filecheck

		axios
			.post("/api/events/", {
				//events/id
				body: formData
			})
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
		<form
			className="col-md-6 offset-md-3 text-center"
			id="eventpatch"
			method="POST"
			data-eventid=""
			onSubmit={handleSubmit}
			action="/api/events/<%= locals.event._id %>"
		>
			<div className="row">
				<h5>Les champs avec un (*) sont obligatoires</h5>
				<label className="control-label">Titre*</label>
				<input
					placeholder="Notre super réal"
					type="text"
					id="title"
					name="title"
					data-vstring="1;256"
					onChange={e => handleInput(e, form, setForm)}
					value={form.title}
					required
				/>
				<span id="i_title" className="form-info">
					Le <b>titre</b> doit faire entre <b>1 et 256 caractères</b>
				</span>

				<label className="control-label">Description*</label>
				<textarea
					placeholder="La description de notre super réal"
					id="description"
					name="description"
					data-vstring="1;2048"
					onChange={e => handleInput(e, form, setForm)}
					value={form.description}
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
					data-vstring="0;256"
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
					data-vurl="true"
					onChange={e => handleInput(e, form, setForm)}
					value={form.url}
				/>
				<span id="i_url" className="form-info">
					Le lien <b>youtube</b> n'est pas au bon <b>format</b>
				</span>

				{/* <img src="<%= locals.image.path %>" /> */}
				{/* 
				<div className="form-group text-center">
					<label htmlFor="img" id="imglabel" className="filebtn">
						Choisir une image
					</label>
					<input className="inputfile" type="file" name="img" id="img" />
				</div> */}

				<input
					name={"document"}
					type={"file"}
					multiple
					onChange={({ target: { files } }) => {
						if (files && files[0]) setFile(files[0]);
					}}
				/>

				<input type="submit" className="submit-btn" value="Modifier l'événement" id="submit-eventpatch" />
			</div>
		</form>
	);
}

function DelEvent() {
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/events/delete/") //delete/id
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
		//id
		<form className="mt-3" method="POST" onSubmit={handleSubmit} action="/api/events/delete/<%= locals.event._id %>">
			<input type="submit" className="delbtn" value="SUPPRIMER DEFINITIVEMENT" id="delete-event" />
		</form>
	);
}

function PatchEventPage() {
	return (
		<>
			<div className="container">
				<h1 className="text-center">Modifier un événement</h1>
				<PatchEvent></PatchEvent>
				<DelEvent></DelEvent>
				<script src="/scripts/core/validation.js" defer></script>
				<script src="/scripts/submitEvent.js" defer></script>
			</div>
		</>
	);
}

/* 
<%= locals.event._id %>
<%= locals.event.title %>
<%= locals.event.address %>
<%= locals.event.description %>
<%= locals.event.eventStart %>
<%= locals.event.eventEnd %>
<%= locals.event.price %>
<%= locals.event.url %>
<%= locals.event.staff %>

	<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />


    <% if (locals.image) { %>
    <img src="<%= locals.image.path %>" />
			<% } %>
*/

export default PatchEventPage;
