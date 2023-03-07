//Library imports
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col } from "react-bootstrap";
import {
	BrowserRouter as Router,
	Route,
	Routes
} from "react-router-dom";

//Component imports
import HeaderBar from "./components/Dashboard/HeaderBar";
import Sidebar from "./components/Dashboard/SideBar";

//Page imports
import Main from "./pages/Main";

function App() {
	return (
		<div className="App">
            <HeaderBar />
			<Row className="m-0 p-0 flex-row">
				<Col id="sidebarWrapper" className="m-0 p-0">
					<Sidebar />
				</Col>
				<Col className="m-3 p-0 justify-content-center">
					<Router className="">
						<Routes>
							<Route path="" element={<Main/>} />
						</Routes>
					</Router>
				</Col>
			</Row>
		</div>
	);
}

export default App;
