import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import axios from "axios";

import "../../main.css";
import { addAlert, createAlertNode } from "../utils/alert";
import { checkFile, handleInput } from "../utils/inputs";

interface PatchVideoForm {
	title: string;
	description: string;
	url: string;
	isFiction: boolean;
	authors: string;
	mainImg: string;
}

interface UrlType {
	id: string;
}

function PatchVideo({ data }: any) {
	//any
	const { id } = useParams<UrlType>();
	let [file, setFile] = useState<File | null>(null);
	let [form, setForm] = useState<PatchVideoForm>(data);

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
		formData.append("authors", form.authors);
		formData.append("isFiction", form.isFiction.toString());

		axios
			.post(`/api/videos/${id}`, formData)
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
					data-videoid={id}
					onSubmit={handleSubmit}
					action={`/api/videos/${id}`}
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
							onChange={e => handleInput(e, form, setForm)}
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
							onChange={e => handleInput(e, form, setForm)}
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
							onChange={e => handleInput(e, form, setForm)}
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
							onChange={e => handleInput(e, form, setForm)}
						/>

						<input
							type="checkbox"
							name="isFiction"
							id="isFiction"
							checked={form.isFiction}
							onChange={e => handleInput(e, form, setForm)}
						/>

						<img src={form.mainImg} />
						{/* <div className="form-group text-center">
							<label htmlFor="img" id="imglabel" className="filebtn">
								Choisir des images
							</label>
							<input className="inputfile" type="file" name="img" id="img" />
						</div> */}

						<input
							name={"document"}
							type={"file"}
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
	const { id } = useParams<UrlType>();

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		axios
			.post(`/api/videos/delete/${id}`)
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
		<form method="POST" action={`/api/videos/delete/${id}`} onSubmit={handleSubmit}>
			<input type="submit" className="delbtn" value="SUPPRIMER DEFINITIVEMENT" id="delete-video" />
		</form>
	);
}

function WrapVideoComponents() {
	const { id } = useParams<UrlType>();
	const [data, setData] = useState<PatchVideoForm>({
		title: "",
		description: "",
		url: "",
		isFiction: false,
		authors: "",
		mainImg: ""
	});
	const [loadState, setLoad] = useState<string>("Loading...");

	useEffect(() => {
		(async function () {
			try {
				let url = "/api/videos/" + id;
				const response = await axios.get(url);

				if (!response.data.error) setData(response.data.video);
				else {
					let alert = createAlertNode(response.data.message, "error");
					addAlert(alert, "#alert-wrapper");

					setLoad("This video does not exist");
				}
			} catch (err) {
				let alert = createAlertNode("An error occured while fetching this video", "error");
				addAlert(alert, "#alert-wrapper");

				setLoad("This video does not exist");
			}
		})();
	}, [id]);

	return data.title.length ? (
		<>
			{/* <Shortened id={state._id} longUrl={state.longUrl} shortUrl={state.shortUrl} /> */}
			<PatchVideo data={data}></PatchVideo>
			<DelVideo></DelVideo>
		</>
	) : (
		<div className="hero-text">
			<h1>{loadState}</h1>
			<h2>Press this button to go home</h2>
			{/* <HomeBtn></HomeBtn> */}
		</div>
	);
}

function PatchVideoPage() {
	let match = useRouteMatch();

	return (
		<Switch>
			<Route exact path={`${match.url}/:id`}>
				<>
					{/* <PatchVideo></PatchVideo>
					<DelVideo></DelVideo> */}
					<WrapVideoComponents></WrapVideoComponents>
				</>
			</Route>
			<Route path={match.path}>404</Route>
			{/* not found */}
		</Switch>
	);
}

export default PatchVideoPage;
