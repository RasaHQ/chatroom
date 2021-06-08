// @flow
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import breaks from "remark-breaks";
import { formatDistance } from "date-fns";
import classnames from "classnames";
import type { ChatMessage } from "./Chatroom";
import { noop, handleShortcodes } from "./utils";
import Carousel from "./Carousel";

type MessageTimeProps = {
  time: number,
  isBot: boolean
};

export const MessageTime = ({ time, isBot }: MessageTimeProps) => {
  if (time === 0) return null;

  const messageTime = Math.min(Date.now(), time);
  const messageTimeObj = new Date(messageTime);
  return (
    <React.Fragment>
    <li
      className={classnames("time", isBot ? "left" : "right")}
      title={messageTimeObj.toISOString()}
    >
      { isBot ? (<span className="bot-avatar"></span>) : (null) }
      <span className="sent"> Sent {formatDistance(messageTimeObj, Date.now())} ago</span>
    </li>
    </React.Fragment>
  );
};

type MessageProps = {
  chat: ChatMessage,
  onButtonClick?: (title: string, payload: string) => void,
  voiceLang?: ?string,
  stickers?: Object
};

const supportSpeechSynthesis = () => "SpeechSynthesisUtterance" in window;

const speak = (message: string, voiceLang: string) => {
  const synth = window.speechSynthesis;
  let voices = [];
  voices = synth.getVoices();
  const toSpeak = new SpeechSynthesisUtterance(message);
  toSpeak.voice = voices.find(voice => voice.lang === voiceLang);
  synth.speak(toSpeak);
};

const Message = ({ chat, onButtonClick, voiceLang = null, stickers = null }: MessageProps) => {
  const message = chat.message;
  const isBot = chat.username === "bot";

  useEffect(() => {
    if (
      isBot &&
      voiceLang != null &&
      message.type === "text" &&
      supportSpeechSynthesis()
    ) {
      speak(message.text, voiceLang);
    }
  }, []);

  switch (message.type) {
    case "locate":
      let hasLocateMessage = (message.locate.message && message.locate.message !== "");
      let finishedLocating = (!onButtonClick);

      useEffect(() => {
        if (onButtonClick) {
          //onButtonClick should only be defined if this was last message
          //useEffect will only run once as if in componentDidMount
          let result = {};
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (e) => {
                result = {
                  "location": {
                    "accuracy": e.coords.accuracy,
                    "altitude": e.coords.altitude,
                    "altitudeAccuracy": e.coords.altitudeAccuracy,
                    "heading": e.coords.heading,
                    "latitude": e.coords.latitude,
                    "longitude": e.coords.longitude,
                    "speed": e.coords.speed
                  }
                }
                onButtonClick(
                  `[My location](https://www.openstreetmap.org/?mlat=${e.coords.latitude}&mlon=${e.coords.longitude}#map=19/${e.coords.latitude}/${e.coords.longitude})`,
                  message.locate.intent + JSON.stringify(result)
                );
              }, (e) => {
                console.error("Couldnt find location", e)
                onButtonClick(message.locate.errorIntent, message.locate.errorIntent);
              }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              });
          } else {
            console.log("Browser doesnt support geolocation");
            onButtonClick(message.locate.errorIntent, message.locate.errorIntent);
          }
        } else {
          console.debug("No need to provide location");
        }
      }, []);

      if (finishedLocating) {
        return null
      } else {
        return (
          <li className={"locate-container"}>
            <span className={"locate-indicator"}></span>
            {hasLocateMessage === true ? (
              <div className="locate-message">
              <Markdown
                source={message.locate.message}
                skipHtml={false}
                allowedTypses={["root", "break"]}
                renderers={{
                  paragraph: ({ children }) => <span>{children}</span>
                }}
                plugins={[breaks]}
              />
              </div>) : null}
          </li>
        )
      }
    case "button":
      return (
        <ul className="chat-buttons">
          {message.buttons.map(({ payload, title, selected }) => (
            <li
              className={classnames("chat-button", {
                "chat-button-selected": selected,
                "chat-button-disabled": !onButtonClick
              })}
              key={payload}
              onClick={
                onButtonClick != null
                  ? () => onButtonClick(title, payload)
                  : noop
              }
            >
              <Markdown
                source={title}
                skipHtml={false}
                allowedTypses={["root", "break"]}
                renderers={{
                  paragraph: ({ children }) => <span>{children}</span>
                }}
                plugins={[breaks]}
              />
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <li className={`chat ${isBot ? "left" : "right"} chat-img`}>
          <img src={message.image} alt="" />
        </li>
      );
    case "text":
      let txt = handleShortcodes(stickers, message.text);

      return (
        <li className={classnames("chat", isBot ? "left" : "right")}>
          <Markdown
            className="text"
            source={txt}
            skipHtml={false}
            allowedTypes={[
              "root",
              "break",
              "blockquote",
              "paragraph",
              "emphasis",
              "strong",
              "link",
              "list",
              "listItem",
              "image"
            ]}
            renderers={{
              paragraph: ({ children }) => <span>{children}</span>,
              link: ({ href, children }) => (
                <a href={href} target="_blank">
                  {children}
                </a>
              )
            }}
            plugins={[breaks]}
          />
        </li>
      );
    case "carousel":
      return (
        <Carousel carousel={message.carousel} onButtonClick={onButtonClick} />
      )
    default:
      return null;
  }
};

export default Message;
