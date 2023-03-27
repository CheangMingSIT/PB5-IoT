from bluepy.btle import UUID, Peripheral, DefaultDelegate, ADDR_TYPE_PUBLIC
# BLE Characteristics
char_uuid = "5865b90d-ea62-4b39-b6a5-de1f949c78c6"

# Address of the peripheral device. Address will be found during scan
addresses = ["E8:9F:6D:0A:34:C2", "AC:0B:FB:6F:9E:CE"]


class NotificationHandler(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleNotification(self, handle, data):
        # decode the value from bytes to string
        decoded_value = data.decode("utf-8")
        print("Received value:", decoded_value)


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
            if device.waitForNotifications(10.0):
                continue

finally:
    # disconnect from the BLE devices
    for device in devices:
        device.disconnect()
