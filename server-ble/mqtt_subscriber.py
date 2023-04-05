import paho.mqtt.client as mqtt
import os, sys, datetime, sqlite3, uuid, math, time

#Config Variable(s)
PATH_DB = "../database/logs.sqlite"
DB_TABLE = "Logs"
DB_DATETIMEFORMAT = "%Y-%m-%d %H:%M:%S.%f"

# Define MQTT broker details
broker_address = "mqtt.example.com"
port = 1883
topic = "maintopic"

#Helper Functions(s)
def printWithTS(inputStr):
	ts = str(datetime.datetime.now())
	print(str(ts) + "\t" + str(inputStr))

# Define function to handle incoming messages
def on_message(client, userdata, message):
	latencyToPublisher = client.ping()

	recievedTimestamp = datetime.datetime.now()
	sentTimestamp = recievedTimestamp - datetime.timedelta(microseconds=latencyToPublisher)

	content = str(message.payload.decode("utf-8"))

	#Try connecting to DB
	tryDbConnection = True
	while tryDbConnection:
		tryDbConnection = False

		clientId = content.split("#")[0]
		action = content.split("#")[1]

		try:
			#Create database connection
			dbConn = sqlite3.connect(PATH_DB)
			dbCursor = dbConn.cursor()
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
			
			dbCursor.execute(query)
			dbConn.commit()
		
		#Caught DB opertional error
		except sqlite3.OperationalError as e:
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
client.connect(broker_address, port=port)
client.subscribe(topic)

# Start the MQTT client loop to listen for incoming messages
client.loop_forever()