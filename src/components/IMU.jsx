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

const IMU = ({ id, onDelete }) => {
  const [deviceName, setDeviceName] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  data1 = generateRandomData();

  const onDeviceConnected = (name) => {
    setDeviceName(name);
  };
  const handleButtonClick = (message) => {
    setData(message);
  };

  const showLoadingComponent = (message) => {
    if (message === 0) {
      setLoading(false);
      if (!loading) setDone(true);
    } else {
      setLoading(true);
    }
  };

  const resethandler = () => {
    setDone(false);
    setLoading(false);
    setData(null);
  };
  return (
    // eslint-disable-next-line no-nested-ternary
    <div key={id} className={`bg-white h-auto dark:text-gray-200 dark:bg-secondary-dark-bg ${done ? 'w-full' : window.innerWidth < 765 ? 'w-40' : 'w-56'}  p-4 pt-2 rounded-2xl`}>
      <div className="grid grid-cols-1 gap-1 mb-5 relative z-0">
        <div className="flex justify-between">
          <p className="text-left">ID: {deviceName}({id})</p>
          <button className="" onClick={onDelete}>
            {/* trash bin */}
            x
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full w-full bg-white dark:bg-secondary-dark-bg opacity-50 z-10 absolute">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-300 " />
          </div>
        ) : null}
        { !done ? (
          <>
            <Stopwatch id={id} onButtonClick={handleButtonClick} />
            <WebBLE
              serviceUuid="automation_io"
              characteristicUuid="aerobic_heart_rate_lower_limit"
              onDeviceConnected={onDeviceConnected}
              sendData={data}
              loadingLongData={showLoadingComponent}
            />
          </>
        ) : (
          <>
            <div className="justify-center overflow-auto mt-3 w-full items-center">
              <D3Line data={data1} color={color} width={`${data1.length * 1.5 * window.innerWidth}`} height={300} />
            </div>
            <button
              type="button"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
            >
              Download
            </button>
            <button
              type="button"
              id="Reset"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
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
