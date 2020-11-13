import React, { useState, useEffect } from "react";
import { Switch, Route, useRouteMatch, useParams, Redirect } from "react-router-dom";
import "../main.css";
import axios from "axios";
import { createAlertNode, addAlert } from "./utils/alert";

function Auth() {
  const [state, setState] = useState({ value: "", errorMsg: "" }); //

  async function checkErrors(value: string) {
    let errMsg = "";

    //if (value.length > 0) if (!validUrl.isWebUri(value)) errMsg = "URL not properly formatted";

    return errMsg;
  }

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.trim();
    //modular

    let errorMsg = await checkErrors(value);
    setState({ value: value, errorMsg: errorMsg });
  }

  function postAuth(longUrl: string) {
    axios
      .post("/api/auth/login", {
        longUrl: longUrl, //
      })
      .then(function (response) {
        if (!response.data.error)
          window.location.href = "/link/" + response.data.urlCode;
        else {
          let alert = createAlertNode(response.data.message, "error");
          addAlert(alert, "#alert-wrapper");
        }
      })
      .catch(function (error) {
        let alert = createAlertNode(
          "Une erreur est survenue lors du log in",
          "error"
        );
        addAlert(alert, "#alert-wrapper");
      });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    postAuth(state.value);
  }

  return (
    <>
      <div className="container container-front" id="container-login">
        <h1 className="square-title text-center">Log in</h1>

        <form
          className="col-md-6 offset-md-3 text-center"
          id="login-form"
          method="POST"
          data-sublogin="true"
          action="/api/auth/login"
        >
          <div className="row">
            <label className="control-label">Email</label>
            <input
              placeholder="Email"
              type="email"
              id="login-email"
              name="email"
              value=""
              required
            />

            <label className="control-label">
              Password{" "}
              <i
                className="fa fa-eye ml-2"
                data-type="showpw"
                data-showpw="login-pw"
                aria-hidden="true"
              ></i>
            </label>
            <input
              placeholder="Password"
              type="password"
              id="login-pw"
              name="password"
              required
            />

            <input
              type="submit"
              className="submit-btn"
              value="Log in"
              id="submit-login"
            />
          </div>
        </form>
      </div>

      <div className="container container-front" id="container-lostpw">
        <h1 className="square-title text-center">Password Recovery</h1>

        <form
          className="col-md-6 offset-md-3 text-center"
          id="lostpw"
          data-lostpw="true"
          method="POST"
          action="/api/auth/lostpw"
        >
          <div className="row">
            <div
              className="alert alert-warning alert-static w-100"
              role="alert"
            >
              We'll send you a mail with instructions to reset your password
            </div>
            <label className="control-label">Email</label>
            <input
              placeholder="youremail@gmail.com"
              type="email"
              id="email-reset"
              name="email"
              value=""
              data-vemail="true"
              required
            />
            <span id="i_email-reset" className="form-info">
              <b>E-mail</b> has to be <b>valid</b>
            </span>
            <input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />
            <input
              type="submit"
              className="submit-btn"
              value="Send"
              id="submit-lostpw"
            />
          </div>
        </form>
      </div>

      <script src="/scripts/core/pwVisibility.js" defer></script>
      <script src="/scripts/submitAuth.js" defer></script>
      <script src="/scripts/core/validation.js" defer></script>
    </>
  );
}

/*
<% if (locals.formData) { %><%= locals.formData.email %><% } %>
	<input type="hidden" name="_csrf" value="<%= locals.csrfToken %>" />

*/

export default Auth;
