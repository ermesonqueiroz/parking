import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useGameContext } from "./contexts/game";
import { socket } from "./services/socket";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import data from "./data.json";
import { getPlateLabel } from "./utils.js";
import InputMask from "react-input-mask";

export default function App() {
  const canvas = useRef(null);

  const { players, parkingLots, tickets, isJoined, keyListeners, joinInGame } =
    useGameContext();
  const [plate, setPlate] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setTimeout(() => setNow(Date.now()), 100);
  }, [now]);

  const me = useMemo(
    () => players.find(({ id }) => socket.id === id),
    [players]
  );

  const plateLabel = useMemo(
    () => me?.plate && getPlateLabel(me.plate.slice(0, 3), data),
    [me]
  );

  const time = useMemo(() => {
    const checkIn = tickets.find(
      ({ player, checkOut }) => player === socket.id && !checkOut
    )?.checkIn;
    const result = now - checkIn || 0;

    return checkIn && result > 0 ? result : null;
  }, [tickets, now]);

  const getCanvas = () => canvas.current.getContext("2d");

  const drawParkingLots = useCallback(() => {
    getCanvas().fillStyle = "#d43f0e";
    parkingLots.forEach((row) => {
      row.forEach((item) => {
        getCanvas().fillRect(item.x, item.y, item.width, item.height);
      });
    });
  }, [parkingLots]);

  useEffect(() => {
    getCanvas().clearRect(0, 0, 600, 600);

    drawParkingLots();
    players.forEach(({ plate, position }) => {
      getCanvas().fillStyle = "#000";
      getCanvas().font = '16px "DM SAns"';
      const textWidth = getCanvas().measureText(plate).width;
      getCanvas().fillText(
        plate,
        position.x - (textWidth - position.width) / 2,
        position.y - 6
      );

      const image = new Image();
      image.src = "/car.png";
      image.onload = () =>
        getCanvas().drawImage(
          image,
          position.x,
          position.y,
          position.height,
          position.width
        );
    });
  }, [drawParkingLots, me, players]);

  function handleOnSubmit(event) {
    event.preventDefault();
    joinInGame(plate);
  }

  function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }

  return (
    <div className="container">
      {isJoined && (
        <div className="header">
          <h1>
            Você é <b>{me?.plate}</b>
          </h1>
          {plateLabel && (
            <h2 style={{ whiteSpace: "nowrap" }}>
              Sua placa é do{" "}
              <b style={{ textTransform: "uppercase" }}>{plateLabel}</b> e{" "}
              {!["alagoas", "bahia", "sergipe"].includes(
                plateLabel.toLowerCase()
              ) && " não "}{" "}
              faz parte do <b>NORDESTE 3</b>
            </h2>
          )}
          <h3 style={{ fontSize: "1.4rem", paddingTop: "10px" }}>
            {msToTime(time * 1000)}
          </h3>
        </div>
      )}
      <canvas height="600px" width="600px" ref={canvas}></canvas>
      {!isJoined ? (
        <form onSubmit={handleOnSubmit} className="placa-container">
          <label htmlFor="placa">PLACA</label>
          <InputMask
            mask="aaa9*99"
            maskChar=""
            formatChars={{
              a: "[A-Za-z]",
              9: "[0-9]",
              "*": "[A-Za-z0-9]",
            }}
            placeholder="Insira uma placa válida"
            onChange={({ target }) => setPlate(target.value.toUpperCase())}
          />
          <input type="submit" value="Entrar" />
        </form>
      ) : (
        <div className="controls-container">
          <button className="left" onClick={keyListeners.left}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <button className="right" onClick={keyListeners.right}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
          <button className="up" onClick={keyListeners.up}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </button>
          <button className="bottom" onClick={keyListeners.down}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>
      )}

      <Accordion.Root className="AccordionRoot" type="single" collapsible>
        {tickets
          ?.filter(({ player, checkOut }) => player === me?.id && checkOut)
          ?.reverse()
          ?.map((ticket, index) => (
            <Accordion.Item
              className="AccordionItem"
              value={`item-${index}`}
              key={`item-${index}`}
            >
              <Accordion.Header className="AccordionHeader">
                <Accordion.Trigger className="AccordionTrigger">
                  <p>
                    <b>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(ticket.total / 100)}
                    </b>
                  </p>
                  <ChevronDownIcon
                    className="AccordionChevron"
                    width={24}
                    height={24}
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="AccordionContent">
                <p>Checkin: {new Date(ticket.checkIn).toLocaleString()}</p>
                <p>Checkout: {new Date(ticket.checkOut).toLocaleString()}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
      </Accordion.Root>
    </div>
  );
}
