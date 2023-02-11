import React from 'react';
import IMU from '../components/IMU';
import {  LineChart } from '../components';
const MultiIMUDataCollectSystem = () => {
  const controlAll = (sta) => {
    // get all IMU
    const IMUContainer = document.getElementById('IMU');
    // get all button in IMU
    const IMUButton = IMUContainer.getElementsByTagName('button');
    // filter id has start
    const IMUButtonStart = Array.from(IMUButton).filter(
      (button) => button.id === sta,
    );
    // click all button
    IMUButtonStart.forEach((button) => button.click());
  };

  const startAll = () => {
    controlAll('Start');
  };

  const stopAll = () => {
    controlAll('Stop');
  };

  const doneAll = () => {
    controlAll('Done');
  };

  return (
    <div>
      <div className="flex gap-0 flex-wrap min-h-screen">
        <div className=" dark:text-gray-200 dark:main-dark-bg m-3 p-4 rounded-2xl  w-full ">
          <p className="font-semibold text-xl">Multi IMU Data Collect system</p>
          {/* a button can control all button  */}
          <div className="flex flex-wrap mt-3 justify-center gap-1 items-center">
          <button
            id="Start"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
            onClick={startAll}
          >
            Start
          </button>
          <button
            id="Stop"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
            onClick={stopAll}
          >
            Stop
          </button>
          <button
            id="Done"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
            onClick={doneAll}
          >
            Done
          </button>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap lg:flex-nowrap  ">
                <div id="IMU" className="flex flex-wrap justify-center gap-1 items-center">
                  <IMU title="imu1" />
                  <IMU title="imu2" />
                  <IMU title="imu3" />
                  <IMU title="imu4" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-full mt-4">
              <div className="flex justify-between items-center gap-2 mb-10">
                <p className="text-xl font-semibold">Sales Overview</p>
              </div>
              <div className="md:w-full overflow-auto">
                <LineChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiIMUDataCollectSystem;
