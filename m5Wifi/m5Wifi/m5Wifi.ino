#include "M5StickCPlus.h"
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi setup
WiFiClient espClient;
PubSubClient client(espClient);
const char* ssid = "Matt-Hotspot";
const char* password = "serenity";

//  device global variables
unsigned long receivedTime = 0;
unsigned long pressedTime = 0;
unsigned long duration = 0;
unsigned long timerDelay = 100;
bool button_pressed = false;
bool deviceConnected = false;
bool questionStarted = false;     // state if question started

// MQTT broker credentials
const char* mqtt_server = "192.168.83.138";
const int mqtt_port = 1883;

// MQTT topic to publish and subscribe to
const char* topic = "m5wifi";

//  function headers
void setupWifi();
void callback(char* topic, byte* payload, unsigned int length);
void connect();


void setup() 
{
  // serial logging setup
  Serial.begin(115200);

  //  led display setup
  M5.begin();
  M5.Lcd.setRotation(3);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0, 2);
  M5.Lcd.printf("WIFI Matt", 0);

  // wifi setup
  setupWifi();

  //  button declarations for the wireless button
  pinMode(0, INPUT);
  pinMode(26, INPUT);
  pinMode(36, INPUT);

  digitalWrite(26, HIGH);
  digitalWrite(36, HIGH);
  digitalWrite(0, HIGH);


  //  mqtt setup
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);  // no need callback for now
  connect();
  client.publish(topic, "Testing connection");
}

void buttonPressCallback() {
  button_pressed = true;
}

void loop()
{
  client.loop();
  M5.update();
  if(client.connected())
  {
      if (digitalRead(26) == LOW) 
      {
        if (!button_pressed && questionStarted) 
        {
          button_pressed = true;
          questionStarted = false;

          pressedTime = millis();
          duration = pressedTime - receivedTime;
          Serial.print("Duration before pressing "+String(duration)+"\n");
          String answer = ("Button 26 pressed User 2 with a duration of "+ String(duration));
            
          client.publish(topic, answer.c_str());
          M5.Lcd.printf("Button 26", 0);

        }
    } 
    else if (digitalRead(36) == LOW) 
    {
      if (!button_pressed && questionStarted) 
      {
        button_pressed = true;
        questionStarted = false;

        pressedTime = millis();
        duration = pressedTime - receivedTime;
        Serial.print("Duration before pressing "+String(duration)+"\n");        
        String answer = ("Button 36 pressed User 2 with a duration of " + String(duration));
        
        client.publish(topic, answer.c_str());
        M5.Lcd.printf("Button 36", 0);
      }
    } 
    else if (digitalRead(0) == LOW) 
    {
      if (!button_pressed && questionStarted) 
      {
        button_pressed = true;
        questionStarted = false;
        
        pressedTime = millis();
        duration = pressedTime - receivedTime;
        Serial.print("Duration before pressing "+String(duration)="\n");  

        String answer = ("Button 0 pressed User 2 with a duration of " + String(duration));

        client.publish(topic, answer.c_str());
        M5.Lcd.printf("Button 0", 0);
      }
    }
    if (digitalRead(26) == HIGH && digitalRead(36) == HIGH && digitalRead(0) == HIGH) {
      button_pressed = false;
    }
  }
  M5.update();
}


//  setup wifi
void setupWifi()
{
  delay(10);
  M5.Lcd.printf("Connecting to %s", ssid);
  WiFi.mode(WIFI_STA);     // Set the mode to WiFi station mode.  
  WiFi.begin(ssid, password);  // Start Wifi connection.  

  //  connection checks
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(500);
    M5.Lcd.print(".");
  }
  M5.Lcd.printf("\nSuccess\n");
  Serial.println("Wifi Connected...");
}

//  leave empty for now
void callback(char* topic, byte* payload, unsigned int length) 
{
  // serial logging
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  String message = "";
  // reading out message
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  if (strstr(message.c_str(), "Question")) 
  {
    Serial.println("Question has started");
    questionStarted = true;
    receivedTime = millis();
    // Serial.println(receivedTime);
  }
}

//  connect to mqtt
void connect()
{
  while(!client.connected())
  {
    Serial.println("Connecting to MQTT broker...\n");
    if (client.connect("")) 
    {
      Serial.println("Connected to MQTT broker");
      client.publish(topic,"M5 stick connected, testing publish");
      client.subscribe(topic);
    } else {
      Serial.print("Failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }
}