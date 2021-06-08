// @flow
import React, { Component } from "react";
import ConnectedChatroom from "./ConnectedChatroom";
import { uuidv4 } from "./utils";
import { fetchTracker, extractMessages } from "./tracker.js";

function without(obj, prop) {
  const copy = Object.assign({}, obj);
  delete copy[prop];
  return copy;
}

export type TrackerState = {
  slots: Object,
  latest_event_time: number,
  paused: boolean,
  sender_id: string,
  latest_message: Object,
  events: Array<Object>
};

type DebuggerViewProps = {
  userId: string,
  host: string,
  channel: string,
  welcomeMessage: ?string,
  startMessage: ?string,
  title: string,
  waitingTimeout?: number,
  speechRecognition: ?string,
  voiceLang: ?string,
  messageBlacklist?: Array<string>,
  fetchOptions?: RequestOptions,
  rasaToken?: string,
  disableForm?: boolean,
  stickers?: Object
};

type DebuggerViewState = {
  tracker: ?TrackerState
};

class DebuggerView extends Component<DebuggerViewProps, DebuggerViewState> {
  state = {
    tracker: null
  };
  intervalHandle = 0;
  chatroomRef = React.createRef<ConnectedChatroom>();

  componentDidMount() {
    this.intervalHandle = window.setInterval(this.updateTrackerView, 1000);
    this.getChatroom().setState({ isOpen: true });
  }

  componentWillUnmount() {
    window.clearInterval(this.intervalHandle);
    this.intervalHandle = 0;
  }

  getChatroom() {
    if (this.chatroomRef.current == null)
      throw new TypeError("chatroomRef is null.");
    return this.chatroomRef.current;
  }

  updateTrackerView = async () => {
    const { fetchOptions, host, userId, rasaToken, disableForm } = this.props;
    const tracker = await fetchTracker(fetchOptions, host, userId, rasaToken);
    this.setState(() => ({ tracker }));
    if (disableForm) {
      //we wont generate any messagse so keep up to date with latest messages
      this.chatroomRef.current.setState({ messages: extractMessages(tracker) });
    }
  };

  render() {
    const { tracker } = this.state;
    const preStyle = {
      fontFamily: "Monaco, Consolas, Courier, monospace",
      fontSize: "10pt"
    };

    return (
      <div className="debug-view" style={{}}>
        <ConnectedChatroom
          ref={this.chatroomRef}
          rasaToken={this.props.rasaToken}
          userId={this.props.userId}
          host={this.props.host}
          channel={this.props.channel || "rest"}
          title={"Chat"}
          speechRecognition={this.props.speechRecognition}
          voiceLang={this.props.voiceLang}
          welcomeMessage={this.props.welcomeMessage}
          startMessage={this.props.startMessage}
          fetchOptions={this.props.fetchOptions}
          recoverHistory={this.props.recoverHistory}
          disableForm={this.props.disableForm}
          stickers={this.props.stickers}
        />
        {this.props.rasaToken ? (
          <div className={"data-history"}>
            <div>
              <p>
                Bot address: <strong>{this.props.host}</strong>
              </p>
              <p>
                Bot channel: <strong>{this.props.channel}</strong>
              </p>
              <p>
                Session Id: <strong>{this.props.userId}</strong>
              </p>
            </div>
            {tracker != null ? (
              <div className="track-info">
                <h3>Slots</h3>
                <pre style={preStyle}>
                  {JSON.stringify(tracker.slots, null, 2)}
                </pre>
                <h3>Latest Message</h3>
                <pre style={preStyle}>
                  {JSON.stringify(
                    without(tracker.latest_message, "intent_ranking"),
                    null,
                    2
                  )}
                </pre>
                <h3>Events</h3>
                <pre style={preStyle}>
                  {JSON.stringify(tracker.events, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ overflowY: "auto" }}>
            Either Rasa REST API is not enabled (e.g. --enable_api --cors "*")
            or{" "}
            <a href="https://rasa.com/docs/rasa/api/http-api/">
              Token is missing (--auth_token abc)
            </a>
            .
          </div>
        )}
      </div>
    );
  }
}

export default DebuggerView;
