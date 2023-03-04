#include <BLEDevice.h>
#include <BLEServer.h>
#include <M5StickCPlus.h>

#define bleServerName "CM"

//value

int switchOn = 1;

// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 1000; 

bool deviceConnected = false;

#define SERVICE_UUID "f9ff6178-529c-43ac-8a99-3a49dda0ab99"

BLECharacteristic sayHiCharacteristics("51ad3874-d28b-4273-b00b-59274eaec158", BLECharacteristic::PROPERTY_NOTIFY);
BLEDescriptor sayHiDescriptor(BLEUUID((uint16_t)0x2902));

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

void setup() {

  Serial.begin(115200);

  M5.begin();
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0, 2);
  M5.Lcd.printf("BLE Slave", 0);

  //setup home button press to answer
  pinMode(M5_BUTTON_HOME, INPUT);
  pinMode(26, INPUT);
  pinMode(36, INPUT);

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

  //Create BLE Characteristics and Descriptop
  bleService->addCharacteristic(&sayHiCharacteristics);
  sayHiDescriptor.setValue("Name");
  sayHiCharacteristics.addDescriptor(&sayHiDescriptor);

  bleService->addCharacteristic(&pressBtnCharacteristics);
  pressBtnDescriptor.setValue("ButtonPress");
  pressBtnCharacteristics.addDescriptor(&pressBtnDescriptor);
  

  //start the service
  bleService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");

}

void loop() {

  if (deviceConnected){
    
    sayHiCharacteristics.setValue("Jon");
    sayHiCharacteristics.notify();

    M5.Lcd.setCursor(0, 20, 2);
    M5.Lcd.print("Button Pressed = ");
    if(digitalRead(26) == LOW){
      pressBtnCharacteristics.setValue("Btn A is pressed");
      pressBtnCharacteristics.notify();
      M5.Lcd.print("top yellow is pressed");
      Serial.print("Btn A");
    }
    if (digitalRead(36) == LOW) {
      pressBtnCharacteristics.setValue("Btn B is pressed");
      pressBtnCharacteristics.notify();
      M5.Lcd.print("right blue is pressed");
      Serial.print("Btn B");
    }
    if (digitalRead(0) == LOW) {
      pressBtnCharacteristics.setValue("Btn C is pressed");
      pressBtnCharacteristics.notify();
      M5.Lcd.print("btm yellow is pressed");
      Serial.print("Btn C");
    }
    


    }

}