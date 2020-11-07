import React from "react";

import "../../main.css";

function PostVideo() {
	return (
		<>
			<h1>bide videos</h1>
			<div className="container">
				<h1 className="text-center">Add video</h1>

				<form className="col-md-6 offset-md-3 text-center" id="video" method="POST" action="/api/videos/">
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
							value=""
							required
						></textarea>
						<span id="i_description" className="form-info">
							La <b>description</b> doit faire entre <b>1 et 2048 caractères</b>
						</span>

						<label className="control-label">Auteurs (séparés par un ';')</label>
						<input placeholder="Jean Dupont; Mr propre" type="text" id="authors" name="authors" value="" />

						<input type="checkbox" name="isFiction" id="isFiction" value="" />

						<h2>img input cover here</h2>
						<div className="form-group text-center">
							<label htmlFor="img" id="imglabel" className="filebtn">
								Choisir des images
							</label>
							<input className="inputfile" type="file" name="img" id="img" required />
						</div>

						<input type="submit" className="submit-btn" value="Ajouter la vidéo" id="submit-video" />
					</div>
				</form>
			</div>

			<script src="/scripts/core/validation.js" defer></script>
			<script src="/scripts/submitVideo.js" defer></script>
		</>
	);
}

/*
<% if (locals.formData) { %><%= locals.formData.url %><% } %>
<% if (locals.formData) { %><%= locals.formData.title %><% } %>

<% if (locals.formData) { %><%= locals.formData.description %><% } %>
<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
<% if (locals.formData) { %><%= locals.formData.isFiction %><% } %>
<% if (locals.formData) { %><%= locals.formData.authors %><% } %>
*/

export default PostVideo;
