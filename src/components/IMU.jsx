import React, { useState } from 'react';
import Stopwatch from './StopWatch';
import WebBLE from './WebBLE';

const IMU = ({ title }) => {
  const [deviceName, setDeviceName] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDeviceConnected = (name) => {
    setDeviceName(name);
  };
  const handleButtonClick = (message) => {
    setData(message);
  };

  const showLoadingComponent = (message) => {
    if (message === 0) setLoading(false);
    else setLoading(true);
  };
  return (
    <div key={title} className={`bg-white h-auto dark:text-gray-200 dark:bg-secondary-dark-bg ${window.innerWidth < 765 ? 'w-40' : 'w-56'}  p-4 pt-2 rounded-2xl`}>
      
      <div className="flex grid grid-cols-1 gap-1 mb-5 relative z-0">
        <h1>ID: {title}</h1>
        {!deviceName ? (<Stopwatch id={title} onButtonClick={handleButtonClick} />) : null}
        <WebBLE
          serviceUuid="automation_io"
          characteristicUuid="aerobic_heart_rate_lower_limit"
          onDeviceConnected={onDeviceConnected}
          sendData={data}
          loadingLongData={showLoadingComponent}
        />
        { loading ? (
        // loading component with a small spinner, opacity 0.5 and cover this component
        <div className="flex justify-center items-center h-full w-full bg-white dark:bg-secondary-dark-bg opacity-50 z-10 absolute">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-300 " />
        </div>
      ) : null}
        
      </div>
      
    </div>
  );
};

export default IMU;
