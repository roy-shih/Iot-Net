import React, { useState } from 'react';
import IMU from '../components/IMU';
import { useStateContext } from '../contexts/ContextProvider';

const MultiIMUDataCollectSystem = () => {
  const { currentColor } = useStateContext();
  const [components, setComponents] = useState([]);

  const handleCreate = () => {
    let newId = components.length;
    // eslint-disable-next-line no-loop-func
    while (components.find((c) => c.id === newId)) {
      newId += 1;
    }
    setComponents([...components, { id: newId }]);
  };

  const handleDelete = (id) => {
    setComponents(components.filter((c) => c.id !== id));
  };

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

  const ResetAll = () => {
    controlAll('Reset');
  };

  const DownloadAll = () => {
    controlAll('Download');
  };
  return (
    <div>
      <div className="flex gap-0 flex-wrap min-h-screen">
        <div className=" dark:text-gray-200 dark:main-dark-bg mt-10 p-4 rounded-2xl  w-full ">
          <p className="font-semibold text-xl">Multi IMU Data Collect system</p>
          {/* a button can control all button  */}
          <div className="flex flex-wrap mt-5 justify-center gap-4 items-center">
            <button
              type="button"
              id="Start"
              className="text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={startAll}
              style={{ backgroundColor: currentColor }}
            >
              Start
            </button>
            <button
              type="button"
              id="Stop"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={stopAll}
              style={{ backgroundColor: currentColor }}
            >
              Stop
            </button>
            <button
              type="button"
              id="Done"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={doneAll}
              style={{ backgroundColor: currentColor }}
            >
              Done
            </button>
            <button
              type="button"
              id="Reset"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={ResetAll}
              style={{ backgroundColor: currentColor }}
            >
              Reset
            </button>
            <button
              type="button"
              id="Download"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={DownloadAll}
              style={{ backgroundColor: currentColor }}
            >
              Download
            </button>
            <button
              type="button"
              id="Download"
              className=" text-white py-2 text-2s opacity-0.9 rounded-full p-4 hover:drop-shadow-xl text-center"
              onClick={handleCreate}
              style={{ backgroundColor: currentColor }}
            >
              +
            </button>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap lg:flex-nowrap  ">
                <div id="IMU" className="flex flex-wrap gap-1 items-center justify-center w-full">
                  {components.map((c) => (
                    <IMU id={c.id} key={c.id} onDelete={() => handleDelete(c.id)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiIMUDataCollectSystem;
