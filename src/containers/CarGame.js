import React, { useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import carImage from "../assets/images/carImg.png";

const CarGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lane, setLane] = useState("mid");

  const moveCar = async (direction) => {
    if (!gameStarted) return;

    let newLane = lane;
    if (direction === "left") newLane = "left";
    if (direction === "right") newLane = "right";

    setLane(newLane);

    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/game/trackEvent`, {
      event: `${direction}`,
      sessionId,
    });
  };

  const startGame = async () => {
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/game/start`
    );
    setSessionId(res.data.sessionId);
    setGameStarted(true);
  };

  const stopGame = async () => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/game/stop`, {
      sessionId,
    });
    setGameStarted(false);
    setSessionId(null);
  };

  const handleGameStatus = () => {
    if (gameStarted) {
      return stopGame();
    }
    startGame();
  };

  useEffect(() => {
    if (lane === "left" || lane === "right") {
      setTimeout(() => {
        setLane("mid");
      }, 1500);
    }
  }, [lane]);

  return (
    <div className="game-container">
      <div className="road">
        <div className={classnames({ animate: gameStarted }, "road-animate")}>
          <div className="dashed-line"></div>
        </div>
        <img src={carImage} alt="Car" className={classnames("car", lane)} />
      </div>

      <div className="controls">
        <div className="arrow-buttons">
          <button onClick={() => moveCar("left")}>⬅</button>
          <button onClick={() => moveCar("right")}>➡</button>
        </div>
      </div>
      <button className="start-stop" onClick={handleGameStatus}>
        {gameStarted ? "Stop" : "Start"} Game
      </button>
    </div>
  );
};

export default CarGame;
