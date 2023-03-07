import { React, useState } from "react";
import { useForm } from "react-hook-form";

import {
	Container,
	Row,
	Card,
	Form,
	Button,
	ButtonGroup
} from "react-bootstrap";

const Main = (props) => {
	const [hasResponseData, setHasResponseData] = useState(false);
	const [responseData, setResponseData] = useState([""]);

	//onClick handler(s)
	function fetchLogsBtn_onClickHandler(event) {
		fetch("http://localhost:8080/api/fetchlogs")
			.then(async (response) => {
				const data = await response.json();

				//Check if response is not status 200
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					return Promise.reject(error);
				}

				setHasResponseData(true);
				setResponseData(data.content);
			})
			.catch((error) => {
				console.error(
					"fetchLogsBtn_onClickHandler: *Error* Unknown error encountered",
					error
				);
			});
	}

	//DOM Snippet(s)
	const Logs = () => {
		return (
			<>
				<Row>
					{responseData.map((log) => (
						<span key={log}>{log}</span>
					))}
				</Row>
				<br />
			</>
		);
	};

	//Main page DOM
	return (
		<Container className="">
			<Row>
				<h1>Logs</h1>
			</Row>
			<br />

			{hasResponseData ? <Logs /> : null}

			<Row className="my-3">
				<Button
					variant="outline-primary"
					onClick={fetchLogsBtn_onClickHandler}
				>
					Fetch Logs
				</Button>
			</Row>
		</Container>
	);
};
export default Main;
