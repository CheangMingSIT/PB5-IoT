//Library import(s)
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { React, useState } from "react";
import { v4 as uuid } from "uuid";

//Library component import(s)
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate
} from "react-router-dom";

//Component import(s)
import NavBar from "./components/layout/NavBar";
import Sidebar from "./components/layout/SideBar";

//Page import(s)
import Main from "./pages/Main";
import Quiz from "./pages/Quiz";

//Component initialization
function App() {
	//State variable(s)
	const [showSideBar, setShowSideBar] = useState(false);

	//Runtime variable(s)
	const sessionId = uuid().toString();

	//Helper method(s)
	const toggleSideBar = () => setShowSideBar(!showSideBar);

	return (
		<div className="App">
			<Router>
				<NavBar toggleSideBar={toggleSideBar} />
				<div className="body">
					<Sidebar
						showSideBar={showSideBar}
						toggleSideBar={toggleSideBar}
					>
						<Routes>
							{/* Main page(s) */}
							<Route path="*" element={<Navigate to="/" />} />
							<Route strict exact path="/" element={<Main />} />

							{/* Quiz page(s) */}
							<Route
								strict
								exact
								path="/quiz"
								element={<Quiz uuid={sessionId} />}
							/>
						</Routes>
					</Sidebar>
				</div>
			</Router>
		</div>
	);
}

export default App;
