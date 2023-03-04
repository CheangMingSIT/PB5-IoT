import asyncio
from bleak import BleakScanner, BleakClient
from bleak.exc import BleakError

# BLE Characteristics
char_uuid = "5865b90d-ea62-4b39-b6a5-de1f949c78c6"

# Address of the peripheral device. Address will be found during scan
address = "E8:9F:6D:0A:34:C2"


async def handle_notification(sender, data):
    # decode the value from bytes to string
    decoded_value = data.decode("utf-8")
    print("Received value:", decoded_value)


async def run():
    async with BleakClient(address) as client:
        # subscribe to notifications for the characteristic
        await client.start_notify(char_uuid, handle_notification)

        # wait for notifications
        while True:
            await asyncio.sleep(0.1)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    previous_value = ""
    loop.run_until_complete(run())
