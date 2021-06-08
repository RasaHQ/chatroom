// @flow

//Polyfills
import "unfetch/polyfill";
import "core-js/stable";
import "regenerator-runtime/runtime";

//Imports
import type { ChatMessage } from "./Chatroom";
import React from "react";
import ReactDOM from "react-dom";
import Chatroom from "./Chatroom";
import { noop, sleep, uuidv4, getAllUrlParams } from "./utils";
import ConnectedChatroom from "./ConnectedChatroom";
import DebuggerView from "./DebuggerView";

const USERID_STORAGE_KEY = "simple-chatroom-cid";

type ChatroomOptions = {
  host: string,
  title?: string,
  welcomeMessage?: string,
  speechRecognition?: string,
  startMessage?: string,
  container: HTMLElement,
  waitingTimeout?: number,
  fetchOptions?: RequestOptions,
  voiceLang?: string,
  rasaToken?: string,
  recoverHistory?: boolean,
  disableForm?: boolean,
  stickers?: Object
};

const determineSession = () => {
  const urlParams = getAllUrlParams();
  let sessionUserId = urlParams.sessionUserId;

  if (!sessionUserId){
    console.debug("No session id in params, attempt retrieve from storage");
    sessionUserId = window.sessionStorage.getItem(USERID_STORAGE_KEY);
  }

  const isNewSession = sessionUserId == null;

  if (isNewSession) {
    console.debug("Is new session");
    sessionUserId = uuidv4();
    window.sessionStorage.setItem(USERID_STORAGE_KEY, sessionUserId);
  }

  console.debug("sessionUserId", sessionUserId)
  return sessionUserId;
}

window.Chatroom = function(options: ChatroomOptions) {
  let sessionUserId = determineSession();

  this.ref = ReactDOM.render(
    <ConnectedChatroom
      rasaToken={options.rasaToken}
      userId={sessionUserId}
      host={options.host}
      channel={options.channel || "rest"}
      title={options.title || "Chat"}
      speechRecognition={options.speechRecognition}
      welcomeMessage={options.welcomeMessage}
      startMessage={options.startMessage}
      waitingTimeout={options.waitingTimeout}
      fetchOptions={options.fetchOptions}
      voiceLang={options.voiceLang}
      recoverHistory={options.recoverHistory}
      disableForm={options.disableForm}
      stickers={options.stickers}
    />,
    options.container
  );

  this.addEvents = (events, cb) => {
    this.ref.addEvents(events, cb);
  };

  this.openChat = () => {
    this.ref.setState({ isOpen: true });
  };
};

window.DebugChatroom = function(options: ChatroomOptions) {
  let sessionUserId = determineSession();

  this.ref = ReactDOM.render(
    <DebuggerView
      rasaToken={options.rasaToken}
      userId={sessionUserId}
      host={options.host}
      channel={options.channel || "rest"}
      title={options.title || "Chat"}
      speechRecognition={options.speechRecognition}
      welcomeMessage={options.welcomeMessage}
      startMessage={options.startMessage}
      waitingTimeout={options.waitingTimeout}
      fetchOptions={options.fetchOptions}
      voiceLang={options.voiceLang}
      recoverHistory={options.recoverHistory}
      disableForm={options.disableForm}
      stickers={options.stickers}
    />,
    options.container
  );

  this.addEvents = (events, cb) => {
    this.ref.getChatroom().addEvents(events, cb);
  };
};


window.DemoChatroom = function() {
  throw Error('Deprecated');
};