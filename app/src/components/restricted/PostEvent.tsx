import React from "react";

import "../../main.css";

function PostEvent() {
	return (
		<>
			<div className="container">
				<h1 className="text-center">Add Event</h1>

				<form className="col-md-6 offset-md-3 text-center" id="event" method="POST" action="/api/events/">
					<div className="row">
						<h5>Les champs avec une (*) sont obligatoires</h5>
						<label className="control-label">Titre*</label>
						<input placeholder="Notre super réal" type="text" id="title" name="title" data-vstring="1;256" required />
						<span id="i_title" className="form-info">
							Le <b>titre</b> doit faire entre <b>1 et 256 caractères</b>
						</span>

						<label className="control-label">Description*</label>
						<textarea
							placeholder="La description de notre super réal"
							id="description"
							name="description"
							data-vstring="1;2048"
							rows={5}
							required
						></textarea>
						<span id="i_description" className="form-info">
							La <b>description</b> doit faire entre <b>1 et 2048 caractères</b>
						</span>

						<label className="control-label">Début de l'événement</label>
						<input type="datetime-local" id="eventStart" name="eventStart" />

						<label className="control-label">Fin de l'événement</label>
						<input type="datetime-local" id="eventEnd" name="eventEnd" />

						<label className="control-label">Adresse</label>
						<input placeholder="12 rue Villedo, 75001, Paris" type="text" id="address" name="address" data-vstring="0;256" />
						<span id="i_address" className="form-info">
							<b>L'addresse</b> ne peut pas faire plus de <b>256 caractères</b>
						</span>

						<label className="control-label">Prix</label>
						<input placeholder="35.50 (au centième d'euro près)" type="number" min="1" id="price" name="price" step=".01" />

						<label className="control-label">Staff (séparés par un ';')</label>
						<input placeholder="Jean Dupont; Mr propre" type="text" id="staff" name="staff" />

						<label className="control-label">Lien youtube</label>
						<input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" type="url" id="url" name="url" data-vUrl="true" />
						<span id="i_url" className="form-info">
							Le lien <b>youtube</b> n'est pas au bon <b>format</b>
						</span>

						<h2>img input cover here</h2>
						<div className="form-group text-center">
							<label htmlFor="img" id="imglabel" className="filebtn">
								Choisir des images
							</label>
							<input className="inputfile" type="file" name="img" id="img" />
						</div>

						<input type="submit" className="submit-btn" value="Ajouter l'événement" id="submit-event" />
					</div>
				</form>
			</div>

			<script src="/scripts/core/validation.js" defer></script>
			<script src="/scripts/submitEvent.js" defer></script>
		</>
	);
}

/*

						<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />

*/

export default PostEvent;
