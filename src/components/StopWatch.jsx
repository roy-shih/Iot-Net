import React, { useState, useEffect } from 'react';

const Stopwatch = ({ id, onButtonClick }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => () => {
    clearInterval(intervalId);
  }, [intervalId]);

  const handleClick = (status) => {
    onButtonClick(status);
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsStarted(true);
      setStartTime(Date.now());
      handleClick(`{"id":"${id}","time":"${time}","status":"start"}`);
      const newIntervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(newIntervalId);
    }
  };

  const handleStop = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false)
      setEndTime(Date.now());
      handleClick(`{"id":"${id}","time":"${time}","status":"stop"}`);
    }
  };

  const handleReset = () => {
    clearInterval(intervalId);
    setIsRunning(false);
    setIsStarted(false);
    handleClick(`{"id":"${id}","time":"${time}","status":"reset"}`);
    setTime(0);
  };

  const handleDone = () => {
    clearInterval(intervalId);
    setIsRunning(false);
    setIsStarted(false);
    handleClick(`{"id":"${id}", "time":"${time}", "status":"done", "startTime":"${startTime}", "endTime":"${endTime}"}`);
    setTime(0);
  };

  const formattedTime = thistime => {
    // change the int number to time format: 00:00 
    const minutes = Math.floor(thistime / 60);
    const seconds = thistime - minutes * 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };
  return (
    <div key={id} className="flex flex-col items-center">
      <h1 className="text-3xl font-bold">{formattedTime(time)}</h1>
      { isStarted ? (
          isRunning ? (
              <div className="grid grid-cols-1 gap-2 mt-5">
                    <button
                        id={`Stop`}
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
                        onClick={handleStop}
                    >
                        Stop
                    </button>
                </div>
              
            ): (
              <div className={`grid grid-cols-${window.innerWidth < 765 ? 1 : 2} gap-2 mt-5`}>
                  <button id={`Del`} className="bg-gray-500 hover:bg-gray-700  text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center" onClick={handleReset}>
                    Del
                  </button>
                <button id={`Done`} className="bg-green-500 hover:bg-green-700  text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center" onClick={handleDone}>
                    Done
                  </button>
              </div>  
            )
          ) : (
            <div className="grid grid-cols-1 gap-2 mt-5">
              <button
                  id={`Start`}
                  className="bg-red-500 hover:bg-red-700 text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
                  onClick={handleStart}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </button>
            </div>
      )}
      </div>
  );
};

export default Stopwatch;
