// @flow
import type { TrackerState } from "./DebuggerView";
import { uuidv4 } from "./utils";

export const fetchTracker = (requestOptions:?Object, host:string, userId:string, rasaToken:?string): Promise<TrackerState> => {
  if (rasaToken) {
    const fetchOptions = Object.assign({}, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    }, requestOptions);

    return fetch(
      `${host}/conversations/${userId}/tracker?token=${rasaToken}`, fetchOptions
    ).then(res => res.json());
  } else {
    throw Error(
      'Rasa Auth Token is missing or other issue. Start your bot with the REST API enabled and specify an auth token. E.g. --enable_api --cors "*" --auth_token abc'
    );
  }
}

export const extractMessages = (tracker) => {
  let messages = []; let msgDetail = {};
  let messageObj = {}; let displayText = "";
  for (event of tracker.events){
    if (["user", "bot"].includes(event.event)) {
      messageObj = {
        time: Math.round(event.timestamp * 1000),
        username: event.event,
        uuid: event.message_id,
        message: {}
      }

      if (("displayText" in event.metadata) && (event.metadata["displayText"] !== "")) {
        displayText = event.metadata["displayText"];
      } else {
        displayText = event.text;
      }

      if (event.text){
        msgDetail = { type: "text", text: displayText };
        messages.push({ ...messageObj, message: msgDetail });
      }

      //text may come with button or other so add these as as separate message
      if (event.data && event.data.buttons) {
        msgDetail = { type: "button", buttons: event.data.buttons };
        messages.push({ ...messageObj, message: msgDetail });
      } else if (event.data && event.data.image) {
        msgDetail = { type: "image", image: event.data.image };
        messages.push({ ...messageObj, message: msgDetail });
      } else if (event.data && event.data.attachment && event.data.attachment.type === "carousel") {
        msgDetail = { type: "carousel", carousel: event.data.attachment.payload };
        messages.push({ ...messageObj, message: msgDetail });
      } else if (event.data && event.data.attachment) {
        msgDetail = { type: "text", text: event.data.attachment };
        messages.push({ ...messageObj, message: msgDetail });
      } else if (event.data && event.data.custom && event.data.custom.locate) {
        msgDetail = { type: "locate", locate: event.data.custom.locate };
        messages.push({ ...messageObj, message: msgDetail });
      } else if (event.data && event.data.custom && event.data.custom.handoff_host) {
        console.error("Not yet implemented (handling of custom handoff event)");
      } else if (event.data && event.data.custom) {
        console.error("Not yet implemented", event);
      }
    }
  }

  return messages;
}

export const appendEvents = (events:Array<Object>, requestOptions:?Object, host:string, userId:string, rasaToken:?string): Promise<TrackerState> => {
  const fetchOptions = Object.assign({}, {
    method: "POST",
    body: JSON.stringify(events),
    headers: { "Content-Type": "application/json" }
  }, requestOptions);

  if (rasaToken) {
    return fetch(
      `${host}/conversations/${userId}/tracker/events?token=${rasaToken}`,
      fetchOptions).then(res => res.json());
  } else {
    throw Error(
      'Rasa Auth Token is missing or other issue. Start your bot with the REST API enabled and specify an auth token. E.g. --enable_api --cors "*" --auth_token abc'
    );
  }
}
