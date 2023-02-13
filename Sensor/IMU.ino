#include <ArduinoBLE.h>
#include "LSM6DS3.h"
#include "Wire.h"

BLEService ctlService("19B10000-E8F2-537E-4F6C-D104768A1214"); // Bluetooth® Low Energy LED Service
 
// Bluetooth® Low Energy LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEByteCharacteristic stateCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);

//Create a instance of class LSM6DS3
LSM6DS3 myIMU(I2C_MODE, 0x6A);    //I2C device address 0x6A

const int ledPin = LED_BUILTIN; // pin to use for the LED
int state=-1;
String DB_AX="S";
String DB_AY="S";
String DB_AZ="S";
String DB_GX="S";
String DB_GY="S";
String DB_GZ="S";

String getValue(String data, char separator, int index){
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;
    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

String add(String s, String data){
  if(data==""){
    return s;
  }
  s+=",";
  s+=data;
  return s;
}

void Upload(String DB){
  bool start=0;
  for(int i=0;i<DB.length();i++){
    String val = getValue(DB,',',i);
    if(val=="S"){
      start=1;
    }
    if(start==1){
      Serial.println(val);
    }
    if(val=="E"){
      break;
    }
  
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial);
 
  // set LED pin to output mode
  pinMode(ledPin, OUTPUT);
 
  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");
 
    while (1);
  }
  if (myIMU.begin() != 0) {
        Serial.println("Device error");
  } else {
        Serial.println("Device OK!");
  }
 
  // set advertised local name and service UUID:
  BLE.setLocalName("IMU-0");
  BLE.setAdvertisedService(ctlService);
 
  // add the characteristic to the service
  ctlService.addCharacteristic(stateCharacteristic);
 
  // add service
  BLE.addService(ctlService);
 
  // set the initial value for the characeristic:
  stateCharacteristic.writeValue(0);
 
  // start advertising
  BLE.advertise();
 
  Serial.println("BLE LED Peripheral");
//    resetX();
//    control_BLE_BEGIN();
}
 
void loop() {
//  grafcet();
  // listen for Bluetooth® Low Energy peripherals to connect:
  BLEDevice central = BLE.central();
 
  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());
    // while the central is still connected to peripheral:
  while (central.connected()) {
        if (stateCharacteristic.written()) {
          state = stateCharacteristic.value();
        }
        if (state=='0') {   
            Serial.println("0 Stop");
            state=-1;
        } else if (state=='1') {   
            Serial.println("1 Record");
            DB_AX=add(DB_AX,String(myIMU.readFloatAccelX()));
            DB_AY=add(DB_AY,String(myIMU.readFloatAccelY()));
            DB_AZ=add(DB_AZ,String(myIMU.readFloatAccelZ()));
            DB_GX=add(DB_GX,String(myIMU.readFloatGyroX()));
            DB_GY=add(DB_GY,String(myIMU.readFloatGyroY()));
            DB_GZ=add(DB_GZ,String(myIMU.readFloatGyroZ()));
        } else if (state=='2') {   
            Serial.println("2 Output");
            DB_AX+=",E";
            DB_AY+=",E";
            DB_AZ+=",E";
            DB_GX+=",E";
            DB_GY+=",E";
            DB_GZ+=",E";
            Upload(DB_AX);
            Upload(DB_AY);
            Upload(DB_AZ);
            Upload(DB_GX);
            Upload(DB_GY);
            Upload(DB_GZ);
            DB_AX="S";
            DB_AY="S";
            DB_AZ="S";
            DB_GX="S";
            DB_GY="S";
            DB_GZ="S";
            state=-1;
        }else if(state=='3') {   
          Serial.println("3 Reset");
          DB_AX="S";
          DB_AY="S";
          DB_AZ="S";
          DB_GX="S";
          DB_GY="S";
          DB_GZ="S";
          state=-1;
        }
      }
 
    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

