import React from "react";
import "../main.css";

import HomeBtn from "./HomeBtn";

function NotFound() {
	return (
		<>
			<h1 className="not-found">404</h1>
			<HomeBtn></HomeBtn>
		</>
	);
}

export default NotFound;
