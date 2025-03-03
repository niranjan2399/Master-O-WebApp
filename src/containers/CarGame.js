/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import carImage from "../assets/images/carImg.png";

const CarGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lane, setLane] = useState("mid");
  const [checkpoints, setCheckpoints] = useState([]);
  const [score, setScore] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);

  const generateCheckpoint = () => {
    const randomLane = Math.random() < 0.5 ? "left" : "right";
    const newCheckpoint = {
      id: Date.now(),
      lane: randomLane,
      position: 0,
    };
    setCheckpoints((prev) => [...prev, newCheckpoint]);
  };

  const moveCar = async (direction) => {
    if (!gameStarted) return;

    setTotalMoves((prev) => prev + 1);
    if (direction === "left") setLane("left");
    if (direction === "right") setLane("right");

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

  const checkCollision = () => {
    checkpoints.forEach((checkpoint) => {
      if (checkpoint.lane === lane && checkpoint.position >= 300) {
        setScore((prev) => prev + 1);
        setCheckpoints((prev) => prev.filter((c) => c.id !== checkpoint.id));

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/game/update-score`, {
          sessionId,
        });
      }
    });
  };

  const updateGame = () => {
    setCheckpoints((prevCheckpoints) =>
      prevCheckpoints
        .map((checkpoint) => ({
          ...checkpoint,
          position: checkpoint.position + 10,
        }))
        .filter((checkpoint) => checkpoint.position < 400)
    );

    checkCollision();
  };

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        generateCheckpoint();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted) {
      const gameInterval = setInterval(updateGame, 100);
      return () => clearInterval(gameInterval);
    }
  }, [checkpoints, gameStarted]);

  useEffect(() => {
    if (lane === "left" || lane === "right") {
      setTimeout(() => {
        setLane("mid");
      }, 1000);
    }
  }, [lane]);

  return (
    <div className="game-container">
      <div className="game-container--header">
        <h2>Car Racing Game</h2>
        <a href="/custom-report">Check Custom Report</a>
      </div>
      <div className="container-main">
        <div className="socre">
          <div>Score: {score}</div>
          <div>Total Moves: {totalMoves}</div>
        </div>
        <div className="road">
          <div className="checkpoints">
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className={`checkpoint ${checkpoint.lane}`}
                style={{ top: checkpoint.position + "px" }}
              />
            ))}
          </div>
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
    </div>
  );
};

export default CarGame;
