import paho.mqtt.client as mqtt
import os, sys, datetime, sqlite3, uuid, math, time
from datetime import datetime as dt

#Config Variable(s)
PATH_DB = "../database/logs.sqlite"
DB_TABLE = "Logs"
DB_DATETIMEFORMAT = "%Y-%m-%d %H:%M:%S.%f"

# Define MQTT broker details
broker_address = "192.168.182.184"
port = 1883
topic = "test"

#Helper Functions(s)
def printWithTS(inputStr):
	ts = str(datetime.datetime.now())
	print(str(ts) + "\t" + str(inputStr))

# Define function to handle incoming messages
def on_message(client, userdata, message):
	recievedTimestamp = datetime.datetime.now()
	recievedMillisecond = int(round(time.time() * 1000))

	content = str(message.payload.decode("utf-8")).rstrip('\x00')

	operationType = int(content.split("#")[2])

	latencyToPublisher = 0
	sentTimestamp = None

	if operationType == 1:
		latencyToPublisher = int(content.split("#")[3])
		sentTimestamp = recievedTimestamp - datetime.timedelta(milliseconds=latencyToPublisher)

	elif operationType == 2:
		milliseconds = int(content.split("#")[3])
		sentTimestamp = datetime.fromtimestamp(milliseconds / 1000.0)

	printWithTS("Received message: " + str(content))

	#Try connecting to DB
	tryDbConnection = True
	while tryDbConnection:
		tryDbConnection = False

		clientId = content.split("#")[0]
		action = str(content.split("#")[1]) + ": Button " + str(content.split("#")[1]) + " pressed"

		#Create database connection
		dbConn = sqlite3.connect(PATH_DB)
		dbCursor = dbConn.cursor()

		try:
			query = """INSERT INTO """ + DB_TABLE + """ 
				(
					log_createdby,
					log_timestamp,
					log_sidBackend,
					log_sidFrontend,
					log_type,
					log_action,
					log_message
				) VALUES (
					'""" + str(clientId) + """',
					'""" + str(sentTimestamp) + """',
					'[GATEWAY]',
					'',
					2,
					0,
					'""" + str(action) + """'
				);"""
			
			query.rstrip('\x00')
			dbCursor.execute(query)
			dbConn.commit()
			printWithTS("Action committed to database.")

		#Caught DB opertional error
		except sqlite3.OperationalError as e:
			printWithTS("Database busy. Waiting...")

			#Retry DB connection
			tryDbConnection = True
			time.sleep(0.01)

		#Caught unexpected error
		except Exception as e:
			#Return internal error exception
			printWithTS("*ERROR* Unexpected exception in on_message handler.")
			print(str(e))
		
		finally:
			#Close database connections
			dbCursor.close()
			dbConn.close()

# Create MQTT client instance and set callbacks
client = mqtt.Client()
client.on_message = on_message

# Connect to MQTT broker and subscribe to topic
printWithTS("Starting listener...")
client.connect(broker_address, port=port)
client.subscribe(topic)
printWithTS("Listener started.")

# Start the MQTT client loop to listen for incoming messages
client.loop_forever()