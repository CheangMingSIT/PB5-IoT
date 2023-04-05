#include <M5StickCPlus.h>
#include <NimBLEDevice.h>

#define SERVICE_UUID "5993d47a-8503-42a2-a9d9-4c960cad1751"
#define CHAR_UUID "4d704edb-d948-42ae-b49f-f8ebe8789552"

int switchOn = 1;

// Timer variables
unsigned long lastTime = 0;
unsigned long timerDelay = 100;

bool button_pressed = false;
bool deviceConnected = false;

NimBLECharacteristic *pressBtnCharacteristics;

class MyServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer *pServer) {
    deviceConnected = true;
    Serial.println("MyServerCallbacks::Connected...");
  };
  void onDisconnect(NimBLEServer *pServer) {
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

  digitalWrite(26, HIGH);
  digitalWrite(36, HIGH);
  digitalWrite(0, HIGH);

  NimBLEDevice::init("BleSlave");

  NimBLEServer *pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  NimBLEService *bleService = pServer->createService(SERVICE_UUID);
  pressBtnCharacteristics = bleService->createCharacteristic(
    CHAR_UUID,
    NIMBLE_PROPERTY::NOTIFY);
  
  bleService->start();

  NimBLEAdvertising *pAdvertising = pServer->getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x0);
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
  if (deviceConnected) {
    M5.Lcd.setCursor(0, 20, 2);
    M5.Lcd.print("Button Pressed = ");
    if (digitalRead(26) == LOW) {
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics->setValue("0");
        pressBtnCharacteristics->notify();
        M5.Lcd.print(" Btn A");
        Serial.print("Btn A");
      }
    } else if (digitalRead(36) == LOW) {
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics->setValue("1");
        pressBtnCharacteristics->notify();
        M5.Lcd.print(" Btn B");
        Serial.print("Btn B");
      }
    } else if (digitalRead(0) == LOW) {
      if (!button_pressed) {
        button_pressed = true;
        pressBtnCharacteristics->setValue("2");
        pressBtnCharacteristics->notify();
        M5.Lcd.print(" Btn C");
        Serial.print("Btn C");
      }
    }
    if (digitalRead(26) == HIGH && digitalRead(36) == HIGH && digitalRead(0) == HIGH) {
      button_pressed = false;
    }
  }
  M5.update();
}
