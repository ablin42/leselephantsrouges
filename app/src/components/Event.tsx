import React, { useState, useEffect } from "react";
import axios from "axios";

import "../main.css";
import { addAlert, createAlertNode } from "./utils/alert";

interface EventData {
	_id: string;
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

function SingleEvent({ event }: any) {
	return (
		<div id={event._id}>
			<h1>
				{event.title}
				{/* //if (locals.user && locals.user.role === "admin") { */}
				<a href={`/Admin/Events/Patch/${event._id}`}>
					<i className="fas fa-edit"></i>
				</a>
				{/* } */}
			</h1>
			<br />
			<p>{event.description}</p>
			<br />
			<h3>Start: {event.eventStart}</h3>
			<h3>End: {event.eventEnd}</h3>
			<h3>Price: {event.price}</h3>
			<h3>Adresse: {event.address}</h3>
			<br />
			<h4>Authors:</h4>
			{event.staff.map((author: string) => {
				return author;
			})}
			<br />
			{/* <% if (locals.events[index].url) { %> */}
			<iframe
				width="560"
				height="315"
				src={event.url}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
			{/* <% } %> <% if (locals.events[index].imgPath) { %> */}
			<img src={event.mainImg} />
		</div>
	);
}

function Event() {
	let [data, setData] = useState<Array<EventData>>([]);
	const [loadState, setLoad] = useState<string>("Loading...");

	useEffect(() => {
		(async function () {
			try {
				let url = "/api/events/";
				const response = await axios.get(url);

				console.log(response.data.events);
				if (!response.data.error) setData(response.data.events);
				else {
					let alert = createAlertNode(response.data.message, "error");
					addAlert(alert, "#alert-wrapper");

					setLoad("An error occured");
				}
			} catch (err) {
				let alert = createAlertNode("An error occured while fetching videos", "error");
				addAlert(alert, "#alert-wrapper");

				setLoad("An error occured");
			}
		})();
	}, []);

	return (
		<>
			<h1>event renders</h1>

			{data.map(event => {
				return <SingleEvent key={event._id} event={event}></SingleEvent>;
			})}
		</>
	);
}

export default Event;
