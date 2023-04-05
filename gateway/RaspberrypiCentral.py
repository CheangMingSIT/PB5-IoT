from bluepy.btle import UUID, Peripheral, DefaultDelegate, ADDR_TYPE_PUBLIC
import paho.mqtt.client as mqtt

# MQTT broker detials
broker_address = "localhost"
broker_port = 1883
client_id = "CMBle"

# BLE Characteristics
char_uuid = "4d704edb-d948-42ae-b49f-f8ebe8789552"

# Address of the peripheral device. Address will be found during scan
addresses = ["AC:0B:FB:6F:9E:CE", "E8:9F:6D:0A:34:C2"]
decoded_value = ""

mqtt_client = mqtt.Client(client_id=client_id)
mqtt_client.connect(broker_address, broker_port)


class NotificationHandler(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleNotification(self, handle, data):
        # decode the value from bytes to string
        decoded_value = data.decode("utf-8")
        print("\nReceived value:", decoded_value)
        mqtt_client.publish("test", decoded_value)


try:
   # connect to the BLE devices
    devices = []
    for address in addresses:
        device = Peripheral(address)
        devices.append(device)
        peripheral_addr = device.addr

    # find the characteristic and enable notifications for each device
    for device in devices:
        char = device.getCharacteristics(uuid=UUID(char_uuid))[0]
        device.writeCharacteristic(char.valHandle + 1, b"\x01\x00")
        print("Notifications enabled for", device.addr)

        # set the notification callback
        notification_handler = NotificationHandler()
        device.withDelegate(notification_handler)

     # wait for notifications
    while True:
        for device in devices:
            if device.waitForNotifications(1.0):
                continue

finally:
    # disconnect from the BLE devices
    for device in devices:
        device.disconnect()
