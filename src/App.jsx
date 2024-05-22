import { useCallback, useRef, useState, useEffect } from "react";
import { useGameContext } from './contexts/game'

export default function App() {
  const canvas = useRef(null);
  const { players } = useGameContext();

  const [parking] = useState([
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]);

  const getCanvas = () => canvas.current.getContext('2d');

  const drawParkingLots = useCallback(() => {
    getCanvas().fillStyle = '#d43f0e';
    parking.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        getCanvas().fillRect((columnIndex * 100) + 80, (rowIndex * 130) + 80, 50, 80);
      })
    });
  }, [parking])

  useEffect(() => {
    getCanvas().clearRect(0, 0, 500, 500);

    drawParkingLots();
    getCanvas().fillStyle = '#0ed450';
    players.forEach(({ position }) => getCanvas().fillRect(position.x, position.y, 30, 30))
  }, [parking, drawParkingLots, players]);

  return (
    <canvas height="500px" width="500px" ref={canvas}></canvas>
  )
}
