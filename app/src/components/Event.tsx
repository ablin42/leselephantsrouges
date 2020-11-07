import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";

function Event() {
	return (
		<>
			<h1>event renders</h1>
		</>
	);
}

/*
<% if (locals.events){ %> <% Object.keys(locals.events).forEach(function (index) { %>
<div class="" id="<%= locals.events[index]._id %>">
	<h1>
		<%= locals.events[index].title %> <% if (locals.user && locals.user.role === "admin") { %>
		<a href="/Admin/events/Patch/<%= locals.events[index]._id %>"><i class="fas fa-edit"></i></a>
		<% } %>
	</h1>
	<br />
	<p><%= locals.events[index].description %></p>
	<br />
	<h3>Start: <%= locals.events[index].eventStart %></h3>
	<h3>End: <%= locals.events[index].eventEnd %></h3>
	<h3>Price: <%= locals.events[index].price %></h3>
	<h3>Adresse: <%= locals.events[index].address %></h3>
	<br />
	<h4>Authors:</h4>
	<% locals.events[index].staff.forEach(function (item) { %> <%= item %> <% }) %>
	<br />
	<% if (locals.events[index].url) { %>
	<iframe
		width="560"
		height="315"
		src="<%= locals.events[index].url %>"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
	<% } %> <% if (locals.events[index].imgPath) { %>
	<img src="<%= locals.events[index].imgPath %>" />
	<% } %>
</div>
<% }) %> <% } else { %>
<div class="text-center bwhite">
	<h1>Event page is under maintenance, please come back later</h1>
</div>
<% } %>
*/

export default Event;
