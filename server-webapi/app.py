#Library Import(s)
from datetime import datetime as dt
import os, sys, datetime, sqlite3, uuid, math, time
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS

#Config Variable(s)
PATH_DB = "../database/logs.sqlite"
SERVER_HOSTREACT = True
SERVER_PORT = 8080
DB_TABLE = "Logs"
DB_DATETIMEFORMAT = "%Y-%m-%d %H:%M:%S.%f"

#Runtime Variable(s)
RUNTIME_UUID = ""

#Frontend Config
sys.path.append(sys.path[0] + "/..")
app = Flask(__name__, static_folder = "frontend/build")
CORS(app)

#Helper Functions(s)
def printWithTS(inputStr):
	ts = str(datetime.datetime.now())
	print(str(ts) + "\t" + str(inputStr))

#Web Server Config
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
	if SERVER_HOSTREACT:
		if path != "" and os.path.exists(app.static_folder + '/' + path):
			return send_from_directory(app.static_folder, path)
		else:
			return send_from_directory(app.static_folder, 'index.html')
	else:
		return "API server online"

#API Function(s)
@app.route("/api/fetchlogs", methods = ["GET"])
def api_fetchLogs():
	if request.method != "GET":
		#Invalid request type
		return Response(status = 400)
	
	returnData = []

	#Try connecting to DB
	tryDbConnection = True
	while tryDbConnection:
		tryDbConnection = False

		#Create database connection
		dbConn = sqlite3.connect(PATH_DB)
		dbCursor = dbConn.cursor()

		try:
			result = dbCursor.execute("""SELECT * FROM """ + DB_TABLE + """;""").fetchall()
			for row in result:
				currentRow = ""
				for col in row:
					currentRow += str(col) + " "
				returnData.append(currentRow)

		#Caught DB opertional error
		except sqlite3.OperationalError as e:
			#Retry DB connection
			tryDbConnection = True
			time.sleep(0.01)

		#Caught unexpected error
		except Exception:
			#Return internal error exception
			printWithTS("/api/fetchlogs: *ERROR* Unexpected exception in database.")
			return Response(status = 500)
		
		finally:
			#Close database connections
			dbCursor.close()
			dbConn.close()
	
	return jsonify(status = 200, content = returnData)
@app.route("/api/startQuestion", methods = ["GET"])
def api_startQuestion():
	if request.method == "GET":
		#Retrieve args
		args = request.args
		inputSid = args.get("sid")

		#Try connecting to DB
		tryDbConnection = True
		while tryDbConnection:
			tryDbConnection = False

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
						'[SERVER]',
						'""" + str(datetime.datetime.now()) + """',
						'""" + str(RUNTIME_UUID) + """',
						'""" + str(inputSid) + """',
						1,
						0,
						'0: Starting quiz question...'
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
				printWithTS("/api/startQuestion: *ERROR* Unexpected exception in database.")
				print(str(e))
				return Response(status = 500)
			
			finally:
				#Close database connections
				dbCursor.close()
				dbConn.close()
			
			return jsonify(status = 200)
	else:
		#Invalid request type
		return Response(status = 400)
@app.route("/api/endQuestion", methods = ["GET"])
def api_endQuestion():
	if request.method == "GET":
		#Retrieve args
		args = request.args
		inputSid = args.get("sid")

		#Try connecting to DB
		tryDbConnection = True
		while tryDbConnection:
			tryDbConnection = False

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
						'[SERVER]',
						'""" + str(datetime.datetime.now()) + """',
						'""" + str(RUNTIME_UUID) + """',
						'""" + str(inputSid) + """',
						1,
						1,
						'1: Quiz question ended.'
					);"""
				
				dbCursor.execute(query)
				dbConn.commit()
			
			#Caught DB opertional error
			except sqlite3.OperationalError as e:
				#Retry DB connection
				tryDbConnection = True
				time.sleep(0.01)

			#Caught unexpected error
			except Exception:
				#Return internal error exception
				printWithTS("/api/endQuestion: *ERROR* Unexpected exception in database.")
				return Response(status = 500)
			
			finally:
				#Close database connections
				dbCursor.close()
				dbConn.close()

			return jsonify(status = 200)
		
	else:
		#Invalid request type
		return Response(status = 400)
@app.route("/api/questionResults", methods = ["POST"])
def api_questionResults():
	if request.method == "POST":
		try:
			returnData = []

			#Retrieve args
			sid = request.form["sid"]
			minutes_time = int(request.form["minutes"])
			seconds_time = int(request.form["seconds"])
			score = int(request.form["score"])
			answer = int(request.form["answer"])

			#Calculate right answer score
			answer_score = round(score / 2)

			#Calculate score/second
			speedBased_score = score - answer_score
			totalSeconds_time = (60 * minutes_time) + seconds_time
			perSecond_score = round(speedBased_score / totalSeconds_time)

			#Create database connection
			dbConn = sqlite3.connect(PATH_DB)
			dbCursor = dbConn.cursor()

			#Variable init
			queryResult = None

			#Get server quiz question end log
			questionEndTimestamp = datetime.datetime.now()
			try:
				dbCursor.execute(
					"""SELECT * FROM """ + DB_TABLE + """ 
					WHERE
						log_sidBackend = '""" + str(RUNTIME_UUID) + """' AND
						log_sidFrontend = '""" + str(sid) + """' AND
						log_type == 1 AND
						log_action == 1
					ORDER BY log_timestamp DESC
					LIMIT 1;""")
				queryResult = dbCursor.fetchone()

				print(queryResult)

				if queryResult == None:
					#Return internal error exception
					printWithTS("/api/questionResults: *ERROR* No 'Question End' log found.")
					return Response(status = 500)
				
				#Convert timestamp string to timestamp
				questionEndTimestamp = dt.strptime(queryResult[2], DB_DATETIMEFORMAT)
			except Exception as e:
				#Close database connections
				dbCursor.close()
				dbConn.close()

				#Return internal error exception
				printWithTS("/api/questionResults: *ERROR* 00: Unexpected exception in database.")
				print(str(e))
				return Response(status = 500)
				
			#Get server quiz question start log
			questionStartTimestamp = datetime.datetime.now()
			try:
				dbCursor.execute(
					"""SELECT * FROM """ + DB_TABLE + """ 
					WHERE
						log_sidBackend = '""" + str(RUNTIME_UUID) + """' AND
						log_sidFrontend = '""" + str(sid) + """' AND
						log_type == 1 AND
						log_action == 0
					ORDER BY log_timestamp DESC
					LIMIT 1;""")
				queryResult = dbCursor.fetchone()

				print(queryResult)

				if queryResult == None:
					#Return internal error exception
					printWithTS("/api/questionResults: *ERROR* No 'Question Start' log found.")
					return Response(status = 500)
				
				#Convert timestamp string to timestamp
				questionStartTimestamp = dt.strptime(queryResult[2], DB_DATETIMEFORMAT)
			except Exception:
				#Close database connections
				dbCursor.close()
				dbConn.close()

				#Return internal error exception
				printWithTS("/api/questionResults: *ERROR* 01: Unexpected exception in database.")
				return Response(status = 500)
			
			#Get client answer question logs
			try:
				dbCursor.execute(
					"""SELECT * FROM """ + DB_TABLE + """ 
					WHERE
						log_type == 2 AND
						log_action == 0 AND
						log_timestamp >= '""" + str(questionStartTimestamp) + """' AND
						log_timestamp <= '""" + str(questionEndTimestamp) + """'
					ORDER BY log_timestamp DESC;""")
				queryResult = dbCursor.fetchall()

				for row in queryResult:
					print(row)

				if queryResult == None:
					return jsonify(status = 200, content = returnData)
			except Exception:
				#Close database connections
				dbCursor.close()
				dbConn.close()

				#Return internal error exception
				printWithTS("/api/questionResults: *ERROR* 02: Unexpected exception in database.")
				return Response(status = 500)
			
			#Close database connections
			dbCursor.close()
			dbConn.close()

			#Map and deduplicate client answers
			clientReplies = {}
			for row in queryResult:
				if str(row[1]) not in clientReplies.keys():
					clientReplies[str(row[1])] = [row[7].split(":")[0], row[2]]

			#Loop tru each client
			clientScores = []
			for key in clientReplies.keys():
				clientScore = 0

				#Calculate score for each client
				clientAnswer = int(clientReplies[key][0])
				
				#If answer is correct
				if clientAnswer == answer:
					clientScore += answer_score
					
					#Calculate answer time diff
					answerTimestamp = dt.strptime(str(clientReplies[key][1]), DB_DATETIMEFORMAT)
					secondsTaken = math.floor((answerTimestamp - questionStartTimestamp).total_seconds())
					secondsMultiplier = totalSeconds_time - secondsTaken

					speedScore = (perSecond_score * secondsMultiplier)
					if speedBased_score < speedScore:
						clientScore += speedBased_score
					else:
						clientScore += speedScore

				#Add record to returnData
				clientScores.append([key, clientScore])

			#Sort by highest score to lowest
			clientScores.sort(key = lambda x: x[1])

			return jsonify(status = 200, content = clientScores)
		except Exception as e:
			print(str(e))
			return Response(status = 500)
	else:
		#Invalid request type
		return Response(status = 400)

@app.route("/api/client", methods = ["GET"])
def api_client():
	if request.method != "GET":
		#Invalid request type
		return Response(status = 400)
	
	#Retrieve args
	try:
		args = request.args
		clientid = args.get("clientid")
		input = args.get("input")

		if clientid == None or input == None:
			return jsonify(status = 400)
	except Exception:
		return jsonify(status = 400)
	
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
				'""" + str(clientid) + """',
				'""" + str(datetime.datetime.now()) + """',
				'""" + str(None) + """',
				'""" + str(None) + """',
				2,
				0,
				""" + str(input) + """: Button """ + str(input) + """ pressed'
			);"""

		dbCursor.execute(query)
		dbConn.commit()

		return jsonify(status = 200)
	
	except Exception:
		return Response(status = 500)
	
	finally:
		#Close database connections
		dbCursor.close()
		dbConn.close()

#Main
if __name__ == "__main__":
	#Generate runtime UUID
	RUNTIME_UUID = str(uuid.uuid4())

	#Create database connection
	dbConn = sqlite3.connect(PATH_DB)
	dbCursor = dbConn.cursor()

	#Create table if not exist
	result = dbCursor.execute("""CREATE TABLE IF NOT EXISTS """ + DB_TABLE + """(
		log_id INTEGER PRIMARY KEY AUTOINCREMENT,
		log_timestamp TEXT, 
		log_sidBackend TEXT,
		log_sidFrontend TEXT,
		log_type INT,
		log_message TEXT
	);""")
	dbConn.commit()
	
	#Close database connections
	dbCursor.close()
	dbConn.close()

	#Start web server
	app.run(
		use_reloader = True,
		port = SERVER_PORT,
		threaded = True
	)