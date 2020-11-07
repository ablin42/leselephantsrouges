import React from "react";

import "../../main.css";

function Admin() {
	return (
		<>
			<div className="container admin-panel">
				<h1 className="square-title text-center">Panel Admin</h1>
				<div className="row justify-content-center">
					<a className="admin-section-block col-lg-3" href="/Admin/Events">
						Événements
					</a>
					<a className="admin-section-block col-lg-3" href="/Admin/Videos">
						Vidéos
					</a>
					<a className="admin-section-block col-lg-3" href="/Admin/Settings">
						Paramètres
					</a>
				</div>
			</div>
		</>
	);
}

export default Admin;
