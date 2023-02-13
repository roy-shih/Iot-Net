import React, { useEffect, useState } from 'react';
// fake data from the imuData.js
import { imuData } from '../data/imuData';

// eslint-disable-next-line consistent-return
const WebBLE = ({ deviceName, serviceUuid, characteristicUuid, datacharacteristicUuid, onDeviceConnected, sendData, loadingLongData }) => {
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // data is a array like [1,2,3,4,5,6,7,8,9,10]
  const [dataArr, setDataArr] = useState([]);

  useEffect(async () => {
    // parse the data
    let parsedData = '';
    if (sendData !== null) {
      parsedData = JSON.parse(sendData);
      console.log(parsedData);
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
    // send data to the device
    // if (device) {
    //   const server = await device.gatt.connect();
    //   const service = await server.getPrimaryService(serviceUuid);
    //   const characteristic = await service.getCharacteristic(characteristicUuid);
    //   const encoder = new TextEncoder();
    //   const encodedData = encoder.encode(sendData);
    //   await characteristic.writeValue(encodedData);
    // }
  }, [sendData]);

  const connect = async () => {
    setLoading(true);
    try {
      const thisdevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUuid] }],
      });
      setDevice(thisdevice);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(characteristicUuid); // write data
      const datacharacteristic = await service.getCharacteristic(datacharacteristicUuid); // read data
      const encoder = new TextEncoder();
      const encodedData = encoder.encode('start');
      await characteristic.writeValue(encodedData);
      datacharacteristic.startNotifications();
      // eslint-disable-next-line no-use-before-define
      datacharacteristic.addEventListener('characteristicvaluechanged', handleNotification);
      onDeviceConnected(deviceName);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = (event) => {
    console.log('Notification data:', event.target.value);
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

  if (!device) {
    // eslint-disable-next-line react/button-has-type
    return <button onClick={connect}><p className="text-sm text-gray-400  mt-1"> connect</p></button>;
  }
};

export default WebBLE;
