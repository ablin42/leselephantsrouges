import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import axios from "axios";

import "../../main.css";
import { createAlertNode, addAlert } from "../utils/alert";
import { checkFile, handleInput } from "../utils/inputs";

interface PatchEventForm {
	title: string;
	description: string;
	eventStart: string;
	eventEnd: string;
	address: string;
	url: string;
	price: string;
	staff: string;
	mainImg: string;
}

interface UrlType {
	id: string;
}

function PatchEvent({ data }: any) {
	const { id } = useParams<UrlType>();
	let [file, setFile] = useState<File | null>(null);
	let [form, setForm] = useState<PatchEventForm>(data);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		let formData = new FormData();
		if (file) {
			let fileError = checkFile(file);

			if (fileError) {
				let alert = createAlertNode(fileError, "error");
				addAlert(alert, "#alert-wrapper");

				return;
			}

			formData.append("img", file);
		}

		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("url", form.url);
		formData.append("address", form.address);
		formData.append("eventStart", form.eventStart);
		formData.append("eventEnd", form.eventEnd);
		formData.append("staff", form.staff);
		formData.append("price", form.price);

		axios
			.post(`/api/events/${id}`, formData)
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
			data-eventid={id}
			onSubmit={handleSubmit}
			action={`/api/events/${id}`}
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

				<img src={data.mainImg} />

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
	const { id } = useParams<UrlType>();

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post(`/api/events/delete/${id}`)
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
		<form className="mt-3" method="POST" onSubmit={handleSubmit} action={`/api/events/delete/${id}`}>
			<input type="submit" className="delbtn" value="SUPPRIMER DEFINITIVEMENT" id="delete-event" />
		</form>
	);
}

function WrapEventComponents() {
	const { id } = useParams<UrlType>();
	const [data, setData] = useState<PatchEventForm>({
		title: "",
		description: "",
		eventStart: "",
		eventEnd: "",
		address: "",
		url: "",
		price: "",
		staff: "",
		mainImg: ""
	});
	const [loadState, setLoad] = useState<string>("Loading...");

	useEffect(() => {
		(async function () {
			try {
				let url = "/api/events/" + id;
				const response = await axios.get(url);
				console.log(response, "agli");

				if (!response.data.error) setData(response.data.event);
				else {
					let alert = createAlertNode(response.data.message, "error");
					addAlert(alert, "#alert-wrapper");

					setLoad("This event does not exist");
				}
			} catch (err) {
				let alert = createAlertNode("An error occured while fetching this event", "error");
				addAlert(alert, "#alert-wrapper");

				setLoad("This event does not exist");
			}
		})();
	}, [id]);

	console.log(data, loadState);

	return data.title.length ? (
		<>
			{/* <Shortened id={state._id} longUrl={state.longUrl} shortUrl={state.shortUrl} /> */}
			<PatchEvent data={data}></PatchEvent>
			<DelEvent></DelEvent>
		</>
	) : (
		<div className="hero-text">
			<h1>{loadState}</h1>
			<h2>Press this button to go home</h2>
			{/* <HomeBtn></HomeBtn> */}
		</div>
	);
}

function PatchEventPage() {
	let match = useRouteMatch();

	return (
		<Switch>
			<Route exact path={`${match.url}/:id`}>
				<div className="container">
					<h1 className="text-center">Modifier un événement</h1>
					<WrapEventComponents></WrapEventComponents>
				</div>
			</Route>
			<Route path={match.path}>404</Route>
			{/* not found */}
		</Switch>
	);
}

export default PatchEventPage;
