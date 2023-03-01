import React, { useEffect, useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Select from 'react-select';
// fake data from the imuData.js
// import { imuData } from '../data/imuData';

// eslint-disable-next-line consistent-return
const WebSocket = ({ onDeviceConnected, sendData, loadingLongData, output }) => {
  const [socketUrl] = useState('wss://imu-websocket-server.onrender.com');
  //   const [messageHistory, setMessageHistory] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [device, setDevice] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  function parseWSData(i, str) {
    const [ax, ay, az, gx, gy, gz] = str.split(',');
    return { time: i, ax: parseFloat(ax), ay: parseFloat(ay), az: parseFloat(az), gx: parseFloat(gx), gy: parseFloat(gy), gz: parseFloat(gz) };
  }

  useEffect(() => {
    if (lastMessage !== null) {
    // setMessageHistory((prev) => prev.concat(lastMessage));
    //   console.log(lastMessage.data);
      const parseMsg = JSON.parse(lastMessage.data);
      if (parseMsg.type === 'deviceList') {
        setDeviceList(parseMsg.data);
      }
      if (parseMsg.type === 'data' && parseMsg.device === device) {
        const dataString = parseMsg.data.split('S')[1].split('E')[0].split(';');
        const outputData = [];
        dataString.forEach((element, index) => {
          if (element !== '') {
            outputData.push(parseWSData(index, element));
          }
        });
        output(outputData);
        loadingLongData(0);
      }
      if (parseMsg.status !== undefined) {
        if (parseMsg.status === 'done') {
          loadingLongData(1);
        }
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
    //   onDisconnect();
      onDeviceConnected(null);
    }
  }, [readyState]);

  useEffect(async () => {
    // parse the data
    if (sendData !== null) {
      let parsedData = JSON.parse(sendData);
      parsedData = JSON.stringify({ ...parsedData, device });
      sendMessage(parsedData);
    }
  }, [sendData]);

  const handleSelect = useCallback((choise) => {
    setDevice(choise.value);
    onDeviceConnected(choise.value);
  }, []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  if (readyState !== ReadyState.OPEN) {
    // big button in the middle, size need to same as the button in the top right
    return <p className="text-sm text-gray-400 text-center  mt-10">{connectionStatus}</p>;
  }
  if (deviceList.length === 0) {
    return <p className="text-sm text-gray-400 text-center  mt-10">Waiting for device list</p>;
  }

  return (
    <div className="mt-10">
      <Select
        options={deviceList}
        onChange={handleSelect}
      />
    </div>
  );
};

export default WebSocket;
