import React from "react";

import "../../main.css";

function PatchVideo() {
	return (
		<>
			<div className="container">
				<h1 className="text-center">Modifier une vidéo</h1>

				<form
					className="col-md-6 offset-md-3 text-center"
					id="videopatch"
					method="POST"
					data-videoid="<%= locals.video._id %>"
					action="/api/videos/<%= locals.video._id %>"
				>
					<div className="row">
						<label className="control-label">Lien youtube</label>
						<input
							placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
							type="url"
							id="url"
							name="url"
							data-vUrl="true"
							value=""
							required
						/>
						<span id="i_url" className="form-info">
							Le lien <b>youtube</b> n'est pas au bon <b>format</b>
						</span>

						<label className="control-label">Titre</label>
						<input placeholder="Notre super réal" type="text" id="title" name="title" data-vstring="1;256" value="" required />
						<span id="i_title" className="form-info">
							Le <b>titre</b> doit faire entre <b>1 et 256 caractères</b>
						</span>

						<label className="control-label">Description</label>
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

						<label className="control-label">Auteurs (séparés par un ';')</label>
						<input placeholder="Jean Dupont; Mr propre" type="text" id="authors" name="authors" value="" />

						<input type="checkbox" name="isFiction" id="isFiction" />

						<img src="<%= locals.image.path %>" />
						<div className="form-group text-center">
							<label htmlFor="img" id="imglabel" className="filebtn">
								Choisir des images
							</label>
							<input className="inputfile" type="file" name="img" id="img" />
						</div>

						<input type="submit" className="submit-btn" value="Modifier la vidéo" id="submit-videopatch" />
					</div>
				</form>

				<form className="mt-3" method="POST" action="/api/videos/delete/<%= locals.video._id %>">
					<input type="submit" className="delbtn" value="SUPPRIMER DEFINITIVEMENT" id="delete-video" />
				</form>
			</div>

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

export default PatchVideo;
