import { createContext, useContext, useEffect, useState } from "react";
import { socket } from '../services/socket'

const GameContext = createContext({});

export function GameContextProvider({ children }) {
  const [isJoined, setIsJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [tickets, setTickets] = useState([]);

  function joinInGame(plate) {
    socket.emit('join', plate);
    setIsJoined(true);
  }

  function handleOnUpdate({ players, parkingLots, tickets }) {
    setPlayers(players)
    setParkingLots(parkingLots)
    setTickets(tickets)
  }

  const keyListeners = {
    down: () => socket.emit('down'),
    up: () => socket.emit('up'),
    right: () => socket.emit('right'),
    left: () => socket.emit('left')
  }

  useEffect(() => {
    function keyDownListener({ key }) {
      const keyToListener = {
        'w': keyListeners.up,
        'a': keyListeners.left,
        'd': keyListeners.right,
        's': keyListeners.down
      }

      keyToListener[key.toLowerCase()]?.call()
    }

    socket.on('update', handleOnUpdate);
    document.addEventListener('keydown', keyDownListener);

    return () => {
      socket.off('update', handleOnUpdate)
      document.removeEventListener('keydown', keyDownListener);
    }
  }, [keyListeners])

  return (
    <GameContext.Provider
      value={{
        players,
        parkingLots,
        tickets,
        isJoined,
        keyListeners,
        joinInGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);
