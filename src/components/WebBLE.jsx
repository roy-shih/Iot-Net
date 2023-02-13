import React, { useEffect, useState } from 'react';
// fake data from the imuData.js
import { imuData } from '../data/imuData';

// eslint-disable-next-line consistent-return
const WebBLE = ({ serviceUuid, characteristicUuid, datacharacteristicUuid, onDeviceConnected, sendData, loadingLongData }) => {
  const [error, setError] = useState(null);
  const [connectState, setConnectState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [characteristic, setCharacteristic] = useState(null);
  // data is a array like [1,2,3,4,5,6,7,8,9,10]
  const [dataArr, setDataArr] = useState([]);

  // initial check
  useEffect(() => {
    if (!navigator.bluetooth) {
      // setError('Web Bluetooth API is not available in this browser.');
      alert('Web Bluetooth API is not available in this browser.');
    }
  }, []);

  useEffect(async () => {
    // parse the data
    let parsedData = '';
    if (sendData !== null) {
      parsedData = JSON.parse(sendData);
      console.log(parsedData);
      if (parsedData.status === 'start') {
        // eslint-disable-next-line no-use-before-define
        handleCommand('1');
      } else if (parsedData.status === 'stop') {
        // eslint-disable-next-line no-use-before-define
        handleCommand('0');
      } else if (parsedData.status === 'reset') {
        // eslint-disable-next-line no-use-before-define
        handleCommand('3');
      } else if (parsedData.status === 'done') {
        // eslint-disable-next-line no-use-before-define
        handleCommand('2');
      }
    }
    if (parsedData.status === 'done') {
      loadingLongData(1);
      let i = 0;
      let start = 0;
      const updatedDataArr = [];
      while (i < imuData.length) {
        if (imuData[i] === 'S') {
          start = 1;
        }
        if (start === 1) {
          updatedDataArr.push(imuData[i]);
        }
        if (imuData[i] === 'E') {
          break;
        }
        i += 1;
      }
      setDataArr(updatedDataArr);
      console.log(dataArr);
      setTimeout(() => {
        loadingLongData(0);
      }, 3000);
    }
  }, [sendData]);

  // eslint-disable-next-line consistent-return
  const connect = async () => {
    setLoading(true);
    try {
      const thisdevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUuid] }],
      });
      onDeviceConnected(thisdevice.name);
      const server = await thisdevice.gatt.connect();
      server.ongattserverdisconnected = () => {
        console.log('Bluetooth device disconnected');
        setCharacteristic(null);
        setConnectState(0);
      };
      const service = await server.getPrimaryService(serviceUuid);
      const writecharacteristic = await service.getCharacteristic(characteristicUuid); // write data
      const datacharacteristic = await service.getCharacteristic(datacharacteristicUuid); // read data
      datacharacteristic.startNotifications();
      // eslint-disable-next-line no-use-before-define
      datacharacteristic.addEventListener('characteristicvaluechanged', handleNotification);
      setConnectState(1);
      return writecharacteristic;
    } catch (e) {
      console.log(e);
      setLoading(false);
      if (e.message === 'User cancelled the requestDevice() chooser.') {
        setConnectState(0);
      } else {
        setError(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if ('bluetooth' in navigator === false) {
      // eslint-disable-next-line no-alert
      alert('Web Bluetooth API is not supported in this browser.');
    } else {
      const char = await connect();
      setCharacteristic(char);
    }
  };

  const handleNotification = (event) => {
    // console.log('Notification data:', event.target.value);
    // decode the data to string
    const data = new DataView(event.target.value.buffer);
    const decoder = new TextDecoder();
    const decodedData = decoder.decode(data);
    console.log(decodedData);
  };

  const handleCommand = (command) => {
    // web ble 傳送資料
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(command);
    console.log(encodedData);
    characteristic.writeValue(encodedData);
  };

  if (loading) {
    return <p className="text-sm text-gray-400  mt-1">Loading...</p>;
  }

  if (error) {
    if (error.message === 'User cancelled the requestDevice() chooser.') {
    // eslint-disable-next-line react/button-has-type
      return <button onClick={connect}><p className="text-sm text-gray-400  mt-1"> connect </p></button>;
    }
    return <p className="text-sm text-gray-400  mt-1">Error</p>;
  }

  if (!connectState) {
    // big button in the middle, size need to same as the button in the top right
    return (
      <div className="animate-pulse flex justify-center mt-10">
        <button type="button" onClick={handleClick} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
          </svg>
          <span>Connect</span>
        </button>
      </div>
    );
  }
  return (
    <div className="flex justify-center mt-5">
      <button type="button" className="bg-green-200 hover:bg-green-300 text-white font-bold py-2 px-4 rounded inline-flex items-center">
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
        </svg>
        <span>connected</span>
      </button>
    </div>
  );
};

export default WebBLE;
