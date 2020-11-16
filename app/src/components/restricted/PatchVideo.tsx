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
function PatchVideo() {
	let [file, setFile] = useState<File | null>(null);
	//any
	let [form, setForm] = useState<any>({
		title: "",
		description: "",
		url: "",
		isFiction: false,
		authors: ""
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
		formData.append("authors", form.authors);
		formData.append("isFiction", form.isFiction);

		//check img file

		axios
			.post("/api/videos/", {
				//video/id
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
			<div className="container">
				<h1 className="text-center">Modifier une vidéo</h1>

				<form
					className="col-md-6 offset-md-3 text-center"
					id="videopatch"
					method="POST"
					data-videoid="<%= locals.video._id %>"
					onSubmit={handleSubmit}
					action="/api/videos/<%= locals.video._id %>"
				>
					<div className="row">
						<label className="control-label">Lien youtube</label>
						<input
							placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
							type="url"
							id="url"
							name="url"
							data-vurl="true"
							value={form.url}
							onChange={handleInput}
							required
						/>
						<span id="i_url" className="form-info">
							Le lien <b>youtube</b> n'est pas au bon <b>format</b>
						</span>

						<label className="control-label">Titre</label>
						<input
							placeholder="Notre super réal"
							type="text"
							id="title"
							name="title"
							data-vstring="1;256"
							value={form.title}
							onChange={handleInput}
							required
						/>
						<span id="i_title" className="form-info">
							Le <b>titre</b> doit faire entre <b>1 et 256 caractères</b>
						</span>

						<label className="control-label">Description</label>
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

						<label className="control-label">Auteurs (séparés par un ';')</label>
						<input
							placeholder="Jean Dupont; Mr propre"
							type="text"
							id="authors"
							name="authors"
							value={form.authors}
							onChange={handleInput}
						/>

						<input type="checkbox" name="isFiction" id="isFiction" value={form.isFiction} onChange={handleInput} />

						{/* <img src="<%= locals.image.path %>" /> */}
						{/* <div className="form-group text-center">
							<label htmlFor="img" id="imglabel" className="filebtn">
								Choisir des images
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

						<input type="submit" className="submit-btn" value="Modifier la vidéo" id="submit-videopatch" />
					</div>
				</form>
			</div>
		</>
	);
}

function DelVideo() {
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post("/api/videos/delete/") //delete/id
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
		<form className="mt-3" method="POST" action="/api/videos/delete/<%= locals.video._id %>" onSubmit={handleSubmit}>
			<input type="submit" className="delbtn" value="SUPPRIMER DEFINITIVEMENT" id="delete-video" />
		</form>
	);
}

function PatchVideoPage() {
	return (
		<>
			<PatchVideo></PatchVideo>
			<DelVideo></DelVideo>
			<script src="/scripts/core/validation.js" defer></script>
			<script src="/scripts/submitVideo.js" defer></script>
		</>
	);
}

/*

<%= locals.video.description %>
<%= locals.video.url %>
<%= locals.video.title %>
<%= locals.video.authors %>
<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />


<% if (locals.video.isFiction == true) { %>checked<% } %>
*/

export default PatchVideoPage;
