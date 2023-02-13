/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import Stopwatch from './StopWatch';
import WebBLE from './WebBLE';
import D3Line from './D3Line';

let data1 = [];

const generateRandomData = () => {
  const data = [];
  for (let i = 0; i < 3; i += 1) {
    const arr = [];
    for (let j = 0; j < 500; j += 1) {
      arr.push({ x: j, y: Math.floor(Math.random() * 10) });
    }
    data.push(arr);
  }
  return data;
};

const color = ['blue', 'red', 'green'];

const IMU = ({ id, onDelete, loadingData }) => {
  const [deviceName, setDeviceName] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  data1 = generateRandomData();

  const onDeviceConnected = (name) => {
    setDeviceName(name);
    console.log(name);
  };
  const handleButtonClick = (message) => {
    setData(message);
  };

  const showLoadingComponent = (message) => {
    if (message === 0) {
      setLoading(false);
      loadingData(0);
      if (!loading) setDone(true);
    } else {
      setLoading(true);
      loadingData(1);
    }
  };

  const resethandler = () => {
    setDone(false);
    setLoading(false);
    loadingData(0);
    setData(null);
  };

  const handleStartTime = (time) => {
    setStartTime(time);
  };

  const handleEndTime = (time) => {
    setEndTime(time);
  };
  return (
    // eslint-disable-next-line no-nested-ternary
    <div key={id} className={`bg-white h-auto dark:text-gray-200 dark:bg-secondary-dark-bg ${done ? 'w-full' : window.innerWidth < 765 ? 'w-40' : 'w-56'}  p-4 pt-2 rounded-2xl`}>
      <div className="grid grid-cols-1 gap-1 mb-5 relative z-0">
        <div className="flex justify-between">
          <p className="text-left">{deviceName} (ID: {id})</p>
          <button className="" onClick={onDelete}>
            {/* trash bin */}
            x
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full w-full bg-gray-100 dark:bg-secondary-dark-bg opacity-50 z-10 absolute">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-300 " />
          </div>
        ) : null}
        {deviceName !== null || !done ? (
          <Stopwatch id={id} onButtonClick={handleButtonClick} startat={handleStartTime} endat={handleEndTime} />
        ) : null}
        {deviceName === null || !done ? (
          // blue circle animate-ping
          <div className="flex justify-center items-center mt-5 mb-3  h-full w-full bg-white dark:bg-secondary-dark-bg z-10 rotate-180">
            <div className="animate-ping rounded-full h-16 w-16 border-b-2 border-sky-600 rotate-180" />
          </div>
        ) : null }
        { !done ? (
          <div className=" z-20">
            <WebBLE
              serviceUuid={'19B10000-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
              characteristicUuid={'19B10001-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
              datacharacteristicUuid={'19B10002-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
              onDeviceConnected={onDeviceConnected}
              sendData={data}
              loadingLongData={showLoadingComponent}
            />
          </div>
        ) : (
          <>
            <div className="justify-center overflow-auto mt-3 w-full items-center">
              <D3Line data={data1} color={color} width={`${data1.length * 1.5 * window.innerWidth}`} height={300} />
            </div>
            <div className="flex justify-between item-center">
              {/* time format */}
              {window.innerWidth < 765 ? (
                <>
                  <p className="text-left mr-5">{new Date(startTime).toLocaleTimeString()}</p>
                  <p className="text-left">({(endTime - startTime) / 1000})</p>
                  <p className="text-left mr-5 ">{new Date(endTime).toLocaleTimeString()}</p>
                </>
              ) : (
                <>
                  <p className="text-left mr-5">Start Time: {new Date(startTime).toLocaleTimeString()}</p>
                  <p className="text-left">Duration: {(endTime - startTime) / 1000} sec</p>
                  <p className="text-left mr-5 ">End Time: {new Date(endTime).toLocaleTimeString()}</p>
                </>
              )}
            </div>
            <button
              type="button"
              className="text-gray-800 dark:text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
            >
              Download
            </button>
            <button
              type="button"
              id="Reset"
              className="text-gray-800 dark:text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={resethandler}
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default IMU;
