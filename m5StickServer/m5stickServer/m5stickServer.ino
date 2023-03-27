#include <BLEDevice.h>
#include <BLEServer.h>
#include <M5StickCPlus.h>

#define bleServerName "CM"

//value

int switchOn = 1;

// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 100; 

bool button_pressed = false;
bool deviceConnected = false;

#define SERVICE_UUID "0ed14b20-61cd-4939-b64b-0e3cfec80486"

BLECharacteristic pressBtnCharacteristics("5865b90d-ea62-4b39-b6a5-de1f949c78c6", BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor pressBtnDescriptor(BLEUUID((uint16_t)0x2902));

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("MyServerCallbacks::Connected...");
  };
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("MyServerCallbacks::Disconnected...");
  }
};

void buttonPressCallback() {
  button_pressed = true;
}


void setup() {

  Serial.begin(115200);

  M5.begin();
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0, 2);
  M5.Lcd.printf("BLE CM C2", 0);

  pinMode(0, INPUT);
  pinMode(26, INPUT);
  pinMode(36, INPUT);

  // attachInterrupt(0, buttonPressCallback, FALLING);
  // attachInterrupt(26, buttonPressCallback, FALLING);
  // attachInterrupt(36, buttonPressCallback, FALLING);

  digitalWrite(26, HIGH);
  digitalWrite(36, HIGH);
  digitalWrite(0, HIGH);
  //Create the BLE Device
  BLEDevice::init(bleServerName);
  
   // Create the BLE Server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *bleService = pServer->createService(SERVICE_UUID);

  bleService->addCharacteristic(&pressBtnCharacteristics);
  pressBtnDescriptor.setValue("ButtonPress");
  pressBtnCharacteristics.addDescriptor(&pressBtnDescriptor);
  

  //start the service
  bleService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x0); 
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");

}

void loop() {

  if (deviceConnected){
    
    M5.Lcd.setCursor(0, 20, 2);
    M5.Lcd.print("Button Pressed = ");
    if(digitalRead(26) == LOW){
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics.setValue("Btn A is pressed");
        pressBtnCharacteristics.notify();
        M5.Lcd.print("top yellow is pressed");
        Serial.print("Btn A");
      }
    }
    else if (digitalRead(36) == LOW) {
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics.setValue("Btn B is pressed");
        pressBtnCharacteristics.notify();
        M5.Lcd.print("right blue is pressed");
        Serial.print("Btn B");
      }
    }
    else if (digitalRead(0) == LOW) {
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics.setValue("Btn C is pressed");
        pressBtnCharacteristics.notify();
        M5.Lcd.print("btm yellow is pressed");
        Serial.print("Btn C");
      }
    }

 if (digitalRead(26) == HIGH && digitalRead(36) == HIGH && digitalRead(0) == HIGH) {
      button_pressed = false;
    }

  }

}