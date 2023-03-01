/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Stopwatch from './StopWatch';
// import WebBLE from './WebBLE';
import WebSocket from './WebSocket';

const IMU = ({ id, onDelete, loadingData }) => {
  const [deviceName, setDeviceName] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [disconnect, setDisconnect] = useState(false);
  const [plotdata, setPlotdata] = useState([]);
  // data1 = generateRandomData();

  useEffect(() => {
    if (disconnect) {
      setLoading(false);
      onDelete(id);
    }
  }, [disconnect]);

  const onDeviceConnected = (name) => {
    setDeviceName(name);
  };
  const handleButtonClick = (message) => {
    setData(message);
  };

  const showLoadingComponent = (message) => {
    if (message === 0) {
      setLoading(false);
      loadingData(0);
      setDone(true);
    } else {
      setLoading(true);
      loadingData(1);
    }
  };

  const resethandler = () => {
    setDisconnect(false);
    setData(`{"id":"${id}","time":"--","status":"reset"}`);
    loadingData(0);
    setDone(false);
  };

  const handleStartTime = (time) => {
    setStartTime(time);
  };

  const handleEndTime = (time) => {
    setEndTime(time);
  };

  const handleDelete = () => {
    setDisconnect(true);
    setLoading(true);
  };

  const handleWEBBLEoutput = (dataarr) => {
    setPlotdata(dataarr);
  };

  function downloadAsCsv(thisdata) {
    const csvString = `time,ax,ay,az,gx,gy,gz\n${thisdata.map((row) => Object.values(row).join(',')).join('\n')}`;
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deviceName}_${id}_${startTime}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleDownload = () => {
    // calculate the time, and replace the time index in data
    const newdata = plotdata;
    const sampleRate = newdata.length / (endTime - startTime);
    newdata.forEach((ele) => {
      // eslint-disable-next-line no-param-reassign
      ele.time = ele.time * sampleRate + startTime;
    });
    downloadAsCsv(newdata);
  };

  return (
    // eslint-disable-next-line no-nested-ternary
    <div key={id} className={`bg-white h-auto dark:text-gray-200 dark:bg-secondary-dark-bg ${done ? 'w-full' : window.innerWidth < 765 ? 'w-40' : 'w-56'}  p-4 pt-2 rounded-2xl`}>
      <div className="grid grid-cols-1 gap-1 mb-5 relative z-0">
        <div className="flex justify-between">
          <p className="text-left">{deviceName} (ID: {id})</p>
          <button className="" onClick={handleDelete}>
            {/* trash bin */}
            x
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full w-full bg-white dark:bg-secondary-dark-bg opacity-50 z-10 absolute">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-300 " />
          </div>
        ) : null}
        {deviceName !== null && !done ? (
          <Stopwatch id={id} onButtonClick={handleButtonClick} startat={handleStartTime} endat={handleEndTime} />
        ) : null}
        {deviceName === null && !done ? (
          // blue circle animate-ping
          <div className="flex justify-center items-center mt-5 mb-3  h-full w-full bg-white dark:bg-secondary-dark-bg z-10 rotate-180">
            <div className="animate-ping rounded-full h-10 w-10 border-b-2 border-sky-600 rotate-180" />
          </div>
        ) : null }
        <div className={`z-20 ${!done ? '' : 'hidden'}`}>
          {/* <WebBLE
            serviceUuid={'19B10000-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
            characteristicUuid={'19B10001-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
            datacharacteristicUuid={'19B10002-E8F2-537E-4F6C-D104768A1214'.toLowerCase()}
            onDeviceConnected={onDeviceConnected}
            sendData={data}
            loadingLongData={showLoadingComponent}
            onDisconnect={disconnect}
            output={handleWEBBLEoutput}
          /> */}
          <WebSocket
            uuid={id}
            onDeviceConnected={onDeviceConnected}
            sendData={data}
            loadingLongData={showLoadingComponent}
            output={handleWEBBLEoutput}
          />
        </div>
        <div className={`justify-center overflow-auto mt-3 w-full items-center ${done ? '' : 'hidden'}`}>
          <LineChart width={0.8 * window.innerWidth} height={300} data={plotdata}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ax" stroke="#8884d8" dot={() => null} />
            <Line type="monotone" dataKey="ay" stroke="#82ca9d" dot={() => null} />
            <Line type="monotone" dataKey="az" stroke="#ffc658" dot={() => null} />
          </LineChart>
          <LineChart width={0.8 * window.innerWidth} height={300} data={plotdata}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="gx" stroke="#0088FE" dot={() => null} />
            <Line type="monotone" dataKey="gy" stroke="#00C49F" dot={() => null} />
            <Line type="monotone" dataKey="gz" stroke="#FFBB28" dot={() => null} />
          </LineChart>
        </div>
        <div className={`${done ? '' : 'hidden'} flex justify-between item-center`}>
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
        <div className={`${done ? '' : 'hidden'} flex justify-between item-center`}>
          <button
            type="button"
            id="Download"
            onClick={handleDownload}
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
        </div>
      </div>
    </div>
  );
};

export default IMU;
