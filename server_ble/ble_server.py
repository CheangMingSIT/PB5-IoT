import os, sys, datetime
from bleak import BleakClient
import asyncio

#Config variable(s)
PATH_LOGSFILE = "../logs/logs.txt"
BLE_CHARACTERISICSID = "5865b90d-ea62-4b39-b6a5-de1f949c78c6"
BLE_CLIENTADDRESS = "E8:9F:6D:0A:34:C2"


#Helper Functions(s)
def printWithTS(inputStr):
	ts = str(datetime.datetime.now())
	print(str(ts) + "\t" + str(inputStr))
	

#Bluetooth Listener
async def bluetooth_listener():
	async with BleakClient(BLE_CLIENTADDRESS) as client:
		#Subscribe to notifications for the characteristic
		await client.start_notify(
			BLE_CHARACTERISICSID,
			bluetooth_onReceiveHandler)

		#Wait for notifications
		while True:
			await asyncio.sleep(0.1)
		
#Bluetooth OnReceive Handler
async def bluetooth_onReceiveHandler(sender, data):
	printWithTS("bluetooth_onReceiveHandler: Incoming message...")

	#Decode incoming bytes to string
	incomingText = data.decode("utf-8")

	#Append incoming string to logs
	try:
		with open(PATH_LOGSFILE, 'a') as writer:
			writer.write(str(sender) + ":" + str(incomingText) + "\n")
	except Exception:
		printWithTS("bluetooth_onReceiveHandler: *ERROR* Unable to append to logs.")
		return

#Main
if __name__ == "__main__":
	#Start bluetooth listener
	loop = asyncio.get_event_loop()
	loop.run_until_complete(bluetooth_listener())

