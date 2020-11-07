import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";

function Video() {
	return (
		<>
			<h1>vid renders</h1>
		</>
	);
}

/*
<% if (locals.videos){ %> <% Object.keys(locals.videos).forEach(function (index) { %>
<div class="" id="<%= locals.videos[index]._id %>">
	<h1>
		<%= locals.videos[index].title %> <% if (locals.user && locals.user.role === "admin") { %>
		<a href="/Admin/Videos/Patch/<%= locals.videos[index]._id %>"><i class="fas fa-edit"></i></a>
		<% } %>
	</h1>
	<br />
	<p><%= locals.videos[index].description %></p>
	<br />
	<h2>isFiction: <%= locals.videos[index].isFiction %></h2>
	<br />
	<h3><%= locals.videos[index].date %></h3>
	<br />
	<h4>Authors:</h4>
	<% locals.videos[index].authors.forEach(function (author) { %> <%= author %> <% }) %>
	<br />
	<iframe
		width="560"
		height="315"
		src="<%= locals.videos[index].url %>"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
	<img src="<%= locals.videos[index].coverPath %>" />
</div>
<% }) %> <% } else { %>
<div class="text-center bwhite">
	<h1>Gallery page is under maintenance, please come back later</h1>
</div>
<% } %> 
*/

export default Video;
