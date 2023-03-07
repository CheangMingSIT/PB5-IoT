import os, sys, datetime
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS

#Config variable(s)
PATH_LOGSFILE = "./logs/logs.txt"
SERVER_HOSTREACT = True

sys.path.append(sys.path[0] + "/..")
app = Flask(__name__, static_folder = "frontend/build")
CORS(app)


#Helper Functions(s)
def printWithTS(inputStr):
	ts = str(datetime.datetime.now())
	print(str(ts) + "\t" + str(inputStr))


#Web Server
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
	if request.method == "GET":
		data = []
		printWithTS("Logs File Path: " + str(PATH_LOGSFILE))
	
		try:
			with open(PATH_LOGSFILE, 'r') as file:
				textLines = file.readlines()
				for line in textLines:
					formattedLine = line.replace('\n', '')
					data.append(formattedLine)

			print(data)

		except Exception:
			#Return internal error exception
			printWithTS("api_fetchLogs: *ERROR* Unable to read from logs.")
			return Response(status = 500)
		
		return jsonify(status = 200, content = data)
	
	#Invalid request type
	return Response(status = 400)


#Main
if __name__ == "__main__":
	#Start web server
	app.run(
		use_reloader = True,
		port = 8080,
		threaded = True
	)

