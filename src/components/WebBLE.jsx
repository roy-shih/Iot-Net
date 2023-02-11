import React, { useEffect, useState } from 'react';
// fake data from the imuData.js
import { imuData } from '../data/imuData';


// eslint-disable-next-line consistent-return
const WebBLE = ({ deviceName, serviceUuid, characteristicUuid, onDeviceConnected, sendData, loadingLongData }) => {
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // data is a array like [1,2,3,4,5,6,7,8,9,10]
  const [dataArr, setDataArr] = useState([]);

  useEffect(async () => {
    // parse the data
    var parsedData="";
    if (sendData !== null) {
      parsedData = JSON.parse(sendData);
      console.log(parsedData);
    } 
    if (parsedData.status == "done"){
      loadingLongData(1);
      var i = 0;
      var start=0;
      //clean data
      let updatedDataArr = [];
      while(i<imuData.length){
        // simulate data upload
        if(start == -1){
            break;
        }
        if(start==1){
            if(imuData[i]=="E") {
                start=-1;
            }else{
                console.log(imuData[i])
                updatedDataArr.push(imuData[i]);
            }
        }else{
            if(imuData[i]=="S") {
                start=1;
            }
        }
        i++;
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
      const characteristic = await service.getCharacteristic(characteristicUuid);
      characteristic.startNotifications();
      // eslint-disable-next-line no-use-before-define
      characteristic.addEventListener('characteristicvaluechanged', handleNotification);
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
