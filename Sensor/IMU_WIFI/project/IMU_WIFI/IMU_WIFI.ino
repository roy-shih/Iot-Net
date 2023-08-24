#include <TFT_eSPI.h> // Graphics and font library for ST7735 driver chip
#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h> // Arduino JSON Library
#include "sensor.h"
#include "esp_adc_cal.h"
#include "ttgo.h"
#include "charge.h"

//  git clone -b development https://github.com/tzapu/WiFiManager.git
#include <WiFiManager.h>         //https://github.com/tzapu/WiFiManager

WebSocketsClient webSocket; // websocket client class instance
StaticJsonDocument<200> doc; // Allocate a static JSON document

#define TP_PIN_PIN          33
#define I2C_SDA_PIN         21
#define I2C_SCL_PIN         22
#define IMU_INT_PIN         38
#define RTC_INT_PIN         34
#define BATT_ADC_PIN        35
#define VBUS_PIN            36
#define TP_PWR_PIN          25
#define LED_PIN             4
#define CHARGE_PIN          32

extern MPU9250 IMU;
int start=-1;
String IMUdata = "S";


TFT_eSPI tft = TFT_eSPI();  // Invoke library, pins defined in User_Setup.h
WiFiManager wm;

char buff[256];
bool rtcIrq = false;
bool initial = 1;
bool otaStart = false;

uint8_t func_select = 0;
uint8_t omm = 99;
uint8_t xcolon = 0;
uint32_t targetTime = 0;       // for next 1 second timeout
uint32_t colour = 0;
int vref = 1100;

bool pressed = false;
uint32_t pressedTime = 0;
bool charge_indication = false;

void upload(){
  Serial.println("Upload");
  IMUdata+="E";
//  String fake = "S0.1,0.2,0.3,0.4,0.5,0.6;0.1,0.2,0.3,0.4,0.5,0.6E";
  String d = "{\"type\":\"data\",\"device\":\"IMU1\",\"data\":\""+IMUdata+"\"}";
  webSocket.sendTXT(d);
//  Serial.print(d);

  IMUdata = "S";
}

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
  const uint8_t* src = (const uint8_t*) mem;
  Serial.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
  for(uint32_t i = 0; i < len; i++) {
    if(i % cols == 0) {
      Serial.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
    }
    Serial.printf("%02X ", *src);
    src++;
  }
  Serial.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {


    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[WSc] Disconnected!\n");
            break;
        case WStype_CONNECTED:
            {
                Serial.printf("[WSc] Connected to url: %s\n",  payload);

                // send message to server when Connected
                webSocket.sendTXT("{\"type\":\"sensor\",\"data\":{\"value\":\"IMU1\",\"label\":\"IMU1\"}}");
            }
            break;
        case WStype_TEXT:{
            Serial.printf("[WSc] get text: %s\n", payload);
            DeserializationError error = deserializeJson(doc, payload);
            if (error) {
              Serial.print(F("deserializeJson() failed: "));
              Serial.println(error.f_str());
              break;
            }
            String type = doc["type"].as<String>();
            if( type == "sensorControl" ){
              String device = doc["device"].as<String>();
              if (device=="IMU1"){
                String Status = doc["status"].as<String>();
                if ( Status == "start"){
                  start=1;
                  Serial.println(start);
                }else if ( Status == "stop"){
                  start=0;
                  Serial.println(start);
                }else if ( Status == "reset"){
                  start=-1;
                  Serial.println(start);
                }else if( Status == "done"){
                  start=-1;
                  upload();
                  Serial.println(start);
                }
              }
            }
            break;
        }
        case WStype_BIN:
            Serial.printf("[WSc] get binary length: %u\n", length);
            hexdump(payload, length);

            // send data to server
            // webSocket.sendBIN(payload, length);
            break;
    case WStype_ERROR:      
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
    }

}
void setupADC()
{
    esp_adc_cal_characteristics_t adc_chars;
    esp_adc_cal_value_t val_type = esp_adc_cal_characterize((adc_unit_t)ADC_UNIT_1, (adc_atten_t)ADC1_CHANNEL_6, (adc_bits_width_t)ADC_WIDTH_BIT_12, 1100, &adc_chars);
    //Check type of calibration value used to characterize ADC
    if (val_type == ESP_ADC_CAL_VAL_EFUSE_VREF) {
        //Serial.printf("eFuse Vref:%u mV", adc_chars.vref);
        vref = adc_chars.vref;
    } else if (val_type == ESP_ADC_CAL_VAL_EFUSE_TP) {
        //Serial.printf("Two Point --> coeff_a:%umV coeff_b:%umV\n", adc_chars.coeff_a, adc_chars.coeff_b);
    } else {
        //Serial.println("Default Vref: 1100mV");
    }
}

void setup(void)
{
    Serial.begin(115200);

    tft.init();
    tft.setRotation(4);
    tft.setSwapBytes(true);
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(3);
    snprintf(buff, sizeof(buff), "Init");
    tft.drawString(buff, 5, 50);
    tft.setTextSize(1);
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    Wire.setClock(400000);

    setupMPU9250();

    setupADC();

    tft.fillScreen(TFT_BLACK);

    pinMode(TP_PIN_PIN, INPUT);
    //! Must be set to pull-up output mode in order to wake up in deep sleep mode
    pinMode(TP_PWR_PIN, PULLUP);
    digitalWrite(TP_PWR_PIN, HIGH);

    pinMode(LED_PIN, OUTPUT);

    pinMode(CHARGE_PIN, INPUT_PULLUP);
    attachInterrupt(CHARGE_PIN, [] {
        charge_indication = true;
    }, CHANGE);

    if (digitalRead(CHARGE_PIN) == LOW) {
        charge_indication = true;
    }
    //    wifimanager
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(3);
    snprintf(buff, sizeof(buff), "WiFi");
    tft.drawString(buff, 5, 50);
    tft.setTextSize(1);
    WiFi.mode(WIFI_STA);
    WiFi.mode(WIFI_STA);
//    wm.resetSettings();
    bool res;
    // res = wm.autoConnect(); // auto generated AP name from chipid
    // res = wm.autoConnect("AutoConnectAP"); // anonymous ap
    res = wm.autoConnect("IMU1","00000000"); // password protected ap

    if(!res) {
        Serial.println("Failed to connect");
         ESP.restart();
    } 
    else {
        //if you get here you have connected to the WiFi    
        Serial.println("connected...yeey :)");
    }

    tft.setTextSize(2);
    snprintf(buff, sizeof(buff), "WebSocket");
    tft.drawString(buff, 3, 50);
    tft.setTextSize(1);
    webSocket.beginSSL("imu-websocket-server.onrender.com", 443);
    webSocket.onEvent(webSocketEvent);

    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.setTextSize(3);
    snprintf(buff, sizeof(buff), "IMU1");
    tft.drawString(buff, 5, 50);
    tft.setTextSize(1);

}

String getVoltage()
{
    uint16_t v = analogRead(BATT_ADC_PIN);
    float battery_voltage = ((float)v / 4095.0) * 2.0 * 3.3 * (vref / 1000.0);
    return String(battery_voltage) + "V";
}
void IMU_Show()
{
//    tft.setTextColor(TFT_GREEN, TFT_BLACK);
//    tft.fillScreen(TFT_BLACK);
//    tft.setTextDatum(TL_DATUM);
    readMPU9250();
    String d=String(IMU.ax)+","+String(IMU.ay)+","+String(IMU.az)+","+String(IMU.gx)+","+String(IMU.gy)+","+String(IMU.gz)+";";
    IMUdata+=d;
    delay(20);
//    Serial.print(IMU.ax);
//    Serial.print(",");
//    Serial.print(IMU.ay);
//    Serial.print(",");
//    Serial.print(IMU.az);
//    Serial.print(",");
//    Serial.print(IMU.gx);
//    Serial.print(",");
//    Serial.print(IMU.gy);
//    Serial.print(",");
//    Serial.println(IMU.gz);    
    
//    snprintf(buff, sizeof(buff), "--  ACC  GYR   MAG");
//    tft.drawString(buff, 0, 0);
//    snprintf(buff, sizeof(buff), "x %.2f  %.2f  %.2f", (int)1000 * IMU.ax, IMU.gx, IMU.mx);
//    tft.drawString(buff, 0, 16);
//    snprintf(buff, sizeof(buff), "y %.2f  %.2f  %.2f", (int)1000 * IMU.ay, IMU.gy, IMU.my);
//    tft.drawString(buff, 0, 32);
//    snprintf(buff, sizeof(buff), "z %.2f  %.2f  %.2f", (int)1000 * IMU.az, IMU.gz, IMU.mz);
//    tft.drawString(buff, 0, 48);
//    delay();
}



void loop()
{
  webSocket.loop(); // Keep the socket alive
  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.drawCentreString(getVoltage(), 30, 10, 1); // Next size up font 2
//  
    if (charge_indication) {
        charge_indication = false;
        if (digitalRead(CHARGE_PIN) == LOW) {
            tft.pushImage(60, 10, 16, 16, charge);
        } else {
            tft.fillRect(60, 10, 16, 16, TFT_BLACK);
        }
    }


    if (digitalRead(TP_PIN_PIN) == HIGH) {
        if (!pressed) {
            initial = 1;
            targetTime = millis() + 1000;
            tft.fillScreen(TFT_BLACK);
            omm = 99;
            func_select = func_select + 1 > 2 ? 0 : func_select + 1;
            digitalWrite(LED_PIN, HIGH);
            delay(100);
            digitalWrite(LED_PIN, LOW);
            pressed = true;
            pressedTime = millis();
        } else {
            if (millis() - pressedTime > 3000) {
                tft.fillScreen(TFT_BLACK);
                tft.drawString("Reset WiFi Setting",  20, tft.height() / 2 );
                delay(3000);
                wm.resetSettings();
                wm.erase(true);
                esp_restart();
            }
        }
    } else {
        pressed = false;
    }

    switch (func_select) {
    case 0:
        if( start ==1 ){
          IMU_Show();
        }
        break;
    case 1:
        webSocket.sendTXT("{\"type\":\"sensorMsg\",\"data\":\"disconnect\",\"device\":\"IMU1\"}");
        tft.setTextColor(TFT_GREEN, TFT_BLACK);
        tft.setTextDatum(MC_DATUM);
        tft.drawString("Press again to wake up",  tft.width() / 2, tft.height() / 2 );
        IMU.setSleepEnabled(true);
        //Serial.println("Go to Sleep");
        delay(3000);
        tft.writecommand(ST7735_SLPIN);
        tft.writecommand(ST7735_DISPOFF);
        esp_sleep_enable_ext1_wakeup(GPIO_SEL_33, ESP_EXT1_WAKEUP_ANY_HIGH);
        esp_deep_sleep_start();
        break;
    default:
        break;
    }
}
