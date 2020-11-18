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

					<ProtectedRoute exact path="/Event/Post" isEnabled={isLogged}>
						<PostEvent></PostEvent>
					</ProtectedRoute>

					<ProtectedRoute path="/Video/Patch" isEnabled={isLogged}>
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
						<Event {...isLogged}></Event>
						<hr />
						<Video {...isLogged}></Video>
					</Route>

					<Route component={NotFound} />
				</Switch>
			</div>

			{/* <svg id="loader" className="rotating" width="410" height="410" viewBox="0 0 410 410">
				<defs>
					<clipPath id="clip-Web_1920_1">
						<rect width="410" height="410" />
					</clipPath>
				</defs>
				<g id="Web_1920_1" data-name="Web 1920 – 1" clip-path="url(#clip-Web_1920_1)">
					<rect width="410" height="410" fill="rgba(46,46,46,0)" />
					<g id="Group_1" data-name="Group 1" transform="translate(-724 -332)">
						<circle id="Ellipse_1" data-name="Ellipse 1" cx="200" cy="200" r="200" transform="translate(729 337)" fill="#fff" />
						<path
							id="Subtraction_1"
							data-name="Subtraction 1"
							d="M593,299H393V99a201.476,201.476,0,0,1,40.307,4.063,198.9,198.9,0,0,1,71.515,30.093,200.582,200.582,0,0,1,72.461,87.994,198.992,198.992,0,0,1,11.654,37.542A201.48,201.48,0,0,1,593,299Z"
							transform="translate(536 238)"
							fill="#f22424"
						/>
						<circle
							id="Ellipse_2"
							data-name="Ellipse 2"
							cx="187.5"
							cy="187.5"
							r="187.5"
							transform="translate(742 350)"
							fill="#1c1c1c"
						/>
					</g>
				</g>
			</svg> */}

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
