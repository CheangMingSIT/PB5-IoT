import paho.mqtt.client as mqtt

# Define MQTT broker details
broker_address = "mqtt.example.com"
port = 1883
username = "myusername"
password = "mypassword"

# Define MQTT topic to subscribe to
topic = "my/topic"

# Define function to handle incoming messages
def on_message(client, userdata, message):
    print("Received message:", str(message.payload.decode("utf-8")))

# Create MQTT client instance and set callbacks
client = mqtt.Client()
client.username_pw_set(username, password)
client.on_message = on_message

# Connect to MQTT broker and subscribe to topic
client.connect(broker_address, port=port)
client.subscribe(topic)

# Start the MQTT client loop to listen for incoming messages
client.loop_forever()