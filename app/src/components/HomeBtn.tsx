import React from "react";

import "../main.css";

function HomeBtn() {
	return (
		<form action="/">
			<button className="btn-404">
				<i className="fas fa-home fa-2x" aria-hidden="true"></i>
			</button>
		</form>
	);
}

export default HomeBtn;
