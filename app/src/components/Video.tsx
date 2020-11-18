import React, { useState, useEffect } from "react";
import axios from "axios";

import "../main.css";
import { addAlert, createAlertNode } from "./utils/alert";

interface VideoData {
	_id: string;
	title: string;
	description: string;
	url: string;
	isFiction: boolean;
	authors: Array<string>;
	mainImg: string;
	date: string;
}

interface SingleVidProp {
	video: VideoData;
	isLogged: boolean;
}

function SingleVideo({ video, isLogged }: SingleVidProp) {
	const renderEditBtn = () => {
		if (isLogged) {
			return (
				<a href={`/Admin/Videos/Patch/${video._id}`}>
					<i className="fas fa-edit"></i>
				</a>
			);
		} else return;
	};

	const renderImg = () => {
		if (video.mainImg) {
			return <img src={video.mainImg} />;
		} else return;
	};

	return (
		<div id={video._id}>
			<h1>
				{video.title}
				{renderEditBtn()}
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
			{renderImg()}
		</div>
	);
}

function Videos(isLogged: boolean) {
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
				return <SingleVideo isLogged={isLogged} key={video._id} video={video}></SingleVideo>;
			})}
		</>
	);
}

export default Videos;
