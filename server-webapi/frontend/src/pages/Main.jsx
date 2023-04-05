//Library import(s)
import { React, useState } from "react";

//Library component import(s)
import { Container, Row, Card, Button, ListGroup } from "react-bootstrap";

//Component initialization
const Main = (props) => {
	//State variable(s)
	const [hasResponseData, setHasResponseData] = useState(false);
	const [hasResponseError, setHasResponseError] = useState(false);
	const [responseData, setResponseData] = useState([""]);
	const [responseDataLen, setResponseDataLen] = useState(0);
	const [lastResponseFetch, setLastResponseFetch] = useState(
		Date().toLocaleString()
	);
	const [fetchLogsBtnLock, setFetchLogsBtnLock] = useState(false);

	//onClick handler(s)
	function fetchLogsBtn_onClickHandler(event) {
		//Reset error flag
		setHasResponseError(false);

		setFetchLogsBtnLock(true);

		fetch("http://localhost:8080/api/fetchlogs")
			.then(async (response) => {
				setFetchLogsBtnLock(true);
				const data = await response.json();

				//Check if response is not status 200
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;
					return Promise.reject(error);
				}

				//Update last fetched timestamp
				setLastResponseFetch(Date().toLocaleString());

				//Update fetched data
				setHasResponseData(true);
				setResponseData(data.content);
				setResponseDataLen(data.content.length);

				setFetchLogsBtnLock(false);
			})
			.catch((error) => {
				console.error(
					"fetchLogsBtn_onClickHandler: *Error* Unknown error encountered",
					error
				);

				//Raise error flag
				setHasResponseError(true);

				setFetchLogsBtnLock(false);
			});
	}

	//DOM Snippet(s)
	const Logs = () => {
		return (
			<Card className="m-0 p-0">
				<Card.Header>Log Count: {responseDataLen}</Card.Header>
				<ListGroup>
					{responseData.map((log) => (
						<ListGroup.Item key={log}>{log}</ListGroup.Item>
					))}
				</ListGroup>
				<Card.Footer className="text-muted">
					Last Fetched: {lastResponseFetch}
				</Card.Footer>
			</Card>
		);
	};
	const NoLogs = () => {
		return (
			<Card className="m-0 p-0">
				<Card.Header>Log Count: {responseDataLen}</Card.Header>
				<Container className="text-center text-black-50 p-5">
					Click 'Fetch Logs'
				</Container>
				<Card.Footer className="text-muted">
					Last Fetched: -
				</Card.Footer>
			</Card>
		);
	};
	const FetchLogsBtn = () => {
		return (
			<Button
				variant="outline-primary"
				onClick={fetchLogsBtn_onClickHandler}
			>
				Fetch Logs
			</Button>
		);
	};
	const FetchLogsBtnDisabled = () => {
		return (
			<Button
				disabled="true"
				variant="outline-secondary"
			>
				Fetching Logs...
			</Button>
		);
	}

	//Return component view
	return (
		<Container>
			<Row>
				<h1>Logs</h1>
			</Row>
			<br />
			<Row>{hasResponseData ? <Logs /> : <NoLogs />}</Row>
			<Row className="my-3">
				{fetchLogsBtnLock ? <FetchLogsBtnDisabled /> : <FetchLogsBtn />}
			</Row>
			<Row className="my-3">
				{hasResponseError ? (
					<span className="text-danger p-0">
						Encountered an error.
					</span>
				) : null}
			</Row>
		</Container>
	);
};
export default Main;