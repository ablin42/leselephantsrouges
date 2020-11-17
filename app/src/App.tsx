import "./main.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import axios from "axios";

import Contact from "./components/Contact";
import Resetpw from "./components/Resetpw";
import Event from "./components/Event";
import Video from "./components/Video";
import Admin from "./components/restricted/Admin";
import Settings from "./components/restricted/Settings";
import PatchEvent from "./components/restricted/PatchEvent";
import PatchVideo from "./components/restricted/PatchVideo";
import PostEvent from "./components/restricted/PostEvent";
import PostVideo from "./components/restricted/PostVideo";
import Auth from "./components/Auth";
import NotFound from "./components/NotFound";

// interface MatchParams {
// 	name: string;
// }

interface Protected {
	//extends RouteComponentProps<MatchParams>
	isEnabled: boolean;
	exact?: boolean;
	children?: any;
	path: string;
}

const ProtectedRoute = ({ isEnabled, children, ...props }: Protected) => {
	return isEnabled ? <Route {...props}>{children}</Route> : <Redirect to="/auth" />;
};

function App() {
	const [isLogged, setLogged] = useState(false);
	const [hadResponse, setResponse] = useState(false);

	useEffect(() => {
		(async function () {
			try {
				const response = await axios.get("/api/auth/isLogged");

				if (!response.data.error && response.data.isLogged) setLogged(true);
				setResponse(true);
			} catch (err) {
				setResponse(true);
				console.log("ERROR ASKING BACKEND ABOUT SESSION");
			}
		})();
	}, []);

	return hadResponse ? (
		<Router>
			<div id="alert-wrapper"></div>
			<div className="container">
				<Switch>
					<ProtectedRoute exact path="/Admin" isEnabled={isLogged}>
						<Admin></Admin>
					</ProtectedRoute>

					<ProtectedRoute exact path="/Settings" isEnabled={isLogged}>
						<Settings></Settings>
					</ProtectedRoute>

					<ProtectedRoute exact path="/Video/Post" isEnabled={isLogged}>
						<PostVideo></PostVideo>
					</ProtectedRoute>

					<ProtectedRoute path="/Event/Post" isEnabled={isLogged}>
						<PostEvent></PostEvent>
					</ProtectedRoute>

					<ProtectedRoute exact path="/Video/Patch" isEnabled={isLogged}>
						<PatchVideo></PatchVideo>
					</ProtectedRoute>

					<ProtectedRoute path="/Event/Patch" isEnabled={isLogged}>
						<PatchEvent></PatchEvent>
					</ProtectedRoute>

					<Route path="/auth/">
						<Auth></Auth>
					</Route>

					<Route exact path="/reset-password">
						<Resetpw></Resetpw>
					</Route>

					<Route exact path="/">
						<Contact></Contact>
						<hr />
						<Event isLogged={isLogged}></Event>
						<hr />
						<Video isLogged={isLogged}></Video>
					</Route>

					<Route component={NotFound} />
				</Switch>
			</div>

			<footer className="invert">
				<p className="footer-text">
					<a rel="noopener noreferrer" target="_blank" href="https://www.ablin.dev">
						@ablin42
					</a>
				</p>
			</footer>
		</Router>
	) : (
		<>"Loading..."</>
	);
}

export default App;
