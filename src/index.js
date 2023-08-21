import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter as Router } from "react-router-dom";
import axios from "axios";
import Promise from "bluebird";
import State from "./libs/state";
import openSocket from "socket.io-client";
import Auth from "./libs/auth";
import AppToaster from "./components/AppToaster";

import App from "./App";
import Loading from "./pages/Loading/Loading";

const API_URL = "https://api.vunbox.com";
const SOCKET_URL = "https://socket.vunbox.com";
// const API_URL = 'http://localhost:3000'
// const SOCKET_URL = 'http://localhost:3001'
const serverState = State();
const socket = openSocket(SOCKET_URL, {
  transports: ['websocket', 'polling']
});
const auth = Auth(socket);

function getServerState() {
  return axios.get(`${API_URL}/getServerState`).then(resp => {
    serverState.set(null, resp.data);

    // listen for changes
    socket.on("diff", serverState.patch);

    return serverState;
  });
}

function getUserAuth() {
  return auth
    .verifySteam()
    .catch(err => {
      /* do nothing */
    })
    .then(auth.setToken)
    .catch(err => {
      /* do nothing */
    });
}

function callAction(action, params) {
  return Promise.fromCallback(function (done) {
    socket.emit("action", action, params, done);
  }).catch(err => {
    AppToaster.show({
      intent: "danger",
      message: err.message
    });
  });
}

Promise.props({
  auth: auth,
  user: getUserAuth(),
  serverState: getServerState(),
  callAction: callAction,
  AppToaster: AppToaster
}).then((props) => {
  // const {user} = auth.getState()
  // props.user = user
  ReactDOM.render(
    <Router>
      <App {...props} />
    </Router>,
    document.getElementById("root")
  );
});

// render loading animation
ReactDOM.render(<Loading />, document.getElementById("root"));
