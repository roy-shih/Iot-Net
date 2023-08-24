// This is for Seeeduino Xiao BLE sence


#include <ArduinoBLE.h>
#include "LSM6DS3.h"
#include "Wire.h"

BLEService Service("19B10000-E8F2-537E-4F6C-D104768A1214"); // Bluetooth® Low Energy LED Service
 
// Bluetooth® Low Energy LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEByteCharacteristic stateCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEStringCharacteristic dataCharacteristic("19B10002-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 50);
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
byte buf[8];
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

String add(String s, String d1, String d2, String d3, String d4, String d5, String d6){
  if(s==""){
    return s;
  }
  s+=",";
  s+=d1;
  s+=";";
  s+=d2;
  s+=";";
  s+=d3;
  s+=";";
  s+=d4;
  s+=";";
  s+=d5;
  s+=";";
  s+=d6;
  return s;
}

void Upload(String DB){
  bool start=0;
  const char* lastval;
  for(int i=0;i<DB.length();i++){
    String val = getValue(DB,',',i);
    if(val==""){
      break;
    }
    if(val=="S"){
      start=1;
      continue;
    }
    if(start==1){
      Serial.println(val);
      const char* Value = val.c_str();
      dataCharacteristic.setValue(Value);
    }
    if(val=="|"){
      break;
    }
  }
}

void setup() {
  Serial.begin(9600);
//  while (!Serial);
 
  // set LED pin to output mode
  pinMode(LED_BUILTIN, OUTPUT);
 
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
  BLE.setLocalName("IMU-3");
  BLE.setDeviceName("IMU-3");
  BLE.setAdvertisedService(Service);
 
  // add the characteristic to the service
  Service.addCharacteristic(stateCharacteristic);
  Service.addCharacteristic(dataCharacteristic);
 
  // add service
  BLE.addService(Service);
 
  // set the initial value for the characeristic:
  stateCharacteristic.writeValue(0);
 
  // start advertising
  BLE.advertise();
 
  Serial.println("BLE LED Peripheral");
//    resetX();
//    control_BLE_BEGIN();
  digitalWrite(LED_BUILTIN, LOW); 
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
    digitalWrite(LED_BUILTIN, HIGH); 
    // while the central is still connected to peripheral:
  while (central.connected()) {
        if (Serial.available()){
          state=Serial.read();
        }
        if (stateCharacteristic.written()) {
          state = stateCharacteristic.value();
        }
        if (state=='0') {   
            Serial.println("0 Stop");
            state=-1;
        } else if (state=='1') {   
            Serial.println("1 Record");
            DB_AX=add(DB_AX,String(myIMU.readFloatAccelX()),String(myIMU.readFloatAccelY()),String(myIMU.readFloatAccelZ()));//,String(myIMU.readFloatGyroX()),String(myIMU.readFloatGyroY()),String(myIMU.readFloatGyroZ()));
//            DB_AY=add(DB_AY,String(myIMU.readFloatAccelY()));
//            DB_AZ=add(DB_AZ,String(myIMU.readFloatAccelZ()));
//            DB_GX=add(DB_GX,String(myIMU.readFloatGyroX()),String(myIMU.readFloatGyroY()),String(myIMU.readFloatGyroZ()));
//            DB_GY=add(DB_GY,String(myIMU.readFloatGyroY()));
//            DB_GZ=add(DB_GZ,String(myIMU.readFloatGyroZ()));
            delay(20);
            
        } else if (state=='2') {   
            Serial.println("2 Output");
            dataCharacteristic.setValue("S");
//            DB_AX+="E";
//            DB_AY+="|";
//            DB_AZ+="|";
//            DB_GX+="E";
//            DB_GY+="|";
//            DB_GZ+="|";
            Upload(DB_AX);
//            Upload(DB_AY);
//            Upload(DB_AZ);
//            Upload(DB_GX);
//            Upload(DB_GY);
//            Upload(DB_GZ);
            dataCharacteristic.setValue("E");
            DB_AX="S";
//            DB_AY="S";
//            DB_AZ="S";
//            DB_GX="S";
//            DB_GY="S";
//            DB_GZ="S";
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
    digitalWrite(LED_BUILTIN, LOW); 
  }
}
