import React, { useState, useEffect } from "react";
import axios from "axios";

import "../main.css";
import { addAlert, createAlertNode } from "./utils/alert";

interface VideoData {
	_id: String;
	title: string;
	description: string;
	url: string;
	isFiction: boolean;
	authors: string;
	mainImg: string;
}

function SingleVideo({ video }: any) {
	return (
		<div id={video._id}>
			<h1>
				{video.title}
				{/* //if (locals.user && locals.user.role === "admin") { */}
				<a href={`/Admin/Videos/Patch/${video._id}`}>
					<i className="fas fa-edit"></i>
				</a>
				{/* } */}
			</h1>
			<br />
			<p>{video.description}</p>
			<br />
			<h2>isFiction: {video.isFiction}</h2>
			<br />
			<h3>{video.date}</h3>
			<br />
			<h4>Authors:</h4>
			{video.authors.map((author: string) => {
				return author;
			})}
			<br />
			<iframe
				width="560"
				height="315"
				src={video.url}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
			<img src={video.mainImg} />
		</div>
	);
}

function Videos() {
	let [data, setData] = useState<Array<VideoData>>([]);
	const [loadState, setLoad] = useState<string>("Loading...");

	useEffect(() => {
		(async function () {
			try {
				let url = "/api/videos/";
				const response = await axios.get(url);

				if (!response.data.error) setData(response.data.videos);
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
			<h1>vid renders</h1>

			{data.map(video => {
				return <SingleVideo key={video._id} video={video}></SingleVideo>;
			})}
		</>
	);
}

export default Videos;
