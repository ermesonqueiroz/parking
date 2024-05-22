import { createContext, useContext, useEffect, useState } from "react";
import { socket } from '../services/socket'

const GameContext = createContext({});

export function GameContextProvider({ children }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.connect();

    const onPlayerJoin = (newPlayers) => setPlayers(newPlayers);
    socket.on('update', onPlayerJoin);

    // const keyListeners = {
      // ArrowDown: () => setPlayerPosition({ ...playerPosition, y: Math.min(470, playerPosition.y + 10) }),
    //   ArrowUp: () => setPlayerPosition({ ...playerPosition, y: Math.max(0, playerPosition.y - 10) }),
    //   ArrowRight: () => setPlayerPosition({ ...playerPosition, x: Math.min(470, playerPosition.x + 10) }),
    //   ArrowLeft: () => setPlayerPosition({ ...playerPosition, x: Math.max(0, playerPosition.x - 10) }),
    // }

    const keyListeners = {
      ArrowDown: () => socket.emit('down'),
      ArrowUp: () => socket.emit('up'),
      ArrowRight: () => socket.emit('right'),
      ArrowLeft: () => socket.emit('left')
    }
    
    function keyDownListener({ key }) {
      keyListeners[key]?.call();
    }

    document.addEventListener('keydown', keyDownListener);
  }, [])

  return (
    <GameContext.Provider value={{ players }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);
