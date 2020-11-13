import "./main.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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

import { InMemoryCache } from "apollo-cache-inmemory";
import { createUploadLink } from "apollo-upload-client";
import { ApolloClient } from "apollo-client";
import { ApolloProvider, Mutation } from "react-apollo";

const apolloCache = new InMemoryCache();

const uploadLink = createUploadLink({
	uri: "http://localhost:8899/graphql", // Apollo Server is served from port 4000
	headers: {
		"keep-alive": "true",
		"cors": "no-cors"
	}
});

const client = new ApolloClient({
	cache: apolloCache,
	link: uploadLink
});

class App extends Component {
	render() {
		return (
			<ApolloProvider client={client}>
				<Router>
					<div id="alert-wrapper"></div>
					<div className="container">
						<Switch>
							<Route exact path="/Admin">
								<Admin></Admin>
							</Route>

							<Route exact path="/Settings">
								<Settings></Settings>
							</Route>

							<Route exact path="/PostVideo">
								<PostVideo></PostVideo>
							</Route>

							<Route exact path="/PostEvent">
								<PostEvent></PostEvent>
							</Route>

							<Route path="/PatchVideo">
								<PatchVideo></PatchVideo>
							</Route>

							<Route path="/PatchEvent">
								<PatchEvent></PatchEvent>
							</Route>

							<Route path="/auth/">
								<Auth></Auth>
							</Route>

							<Route exact path="/reset-password">
								<Resetpw></Resetpw>
							</Route>

							<Route exact path="/">
								<Contact></Contact>
								<hr />
								<Event></Event>
								<hr />
								<Video></Video>
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
			</ApolloProvider>
		);
	}
}

export default App;
