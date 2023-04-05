//Library import(s)
import React, { useState, useEffect } from "react";

//Library component import(s)
import {
	Container,
	Row,
	Col,
	Button,
	Card,
	Alert,
	ListGroup
} from "react-bootstrap";

//Icon & images import(s)
import { IoMdArrowBack } from "react-icons/io";
import { FaPlay, FaStop, FaPause } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import {
	BsFillSquareFill,
	BsFillCircleFill,
	BsFillTriangleFill,
	BsFillPentagonFill
} from "react-icons/bs";

//Data import(s)
import { quizData } from "../data/QuizData";

//Component initialization
const Quiz = ({ props, uuid }) => {
	//Debugging
	const bypassAPI = false;

	//State variable(s)
	const [error, setError] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const [lockStartTimerBtn, setLockstartTimerBtn] = useState(false);

	const [timerCompleted, setTimerCompleted] = useState(false);
	const [timerReset, setTimerReset] = useState(false);
	const [timerStarted, setTimerStarted] = useState(false);
	const [timerRunning, setTimerRunning] = useState(false);
	const [timerMinutes, setTimerMinutes] = useState(0);
	const [timerSeconds, setTimerSeconds] = useState(0);

	const [quizStarted, setQuizStarted] = useState(false);
	const [quizQuestioning, setQuizQuestioning] = useState(false);
	const [quizSelected, setQuizSelected] = useState(null);
	const [quizQuestion, setQuizQuestion] = useState(null);
	const [quizQuestionPos, setQuizQuestionPos] = useState(-1);
	const [quizLastQuestion, setQuizLastQuestion] = useState(0);
	const [quizResults, setQuizResults] = useState({});

	//Runtime variable(s)
	const quizOptColor = ["primary", "danger", "success", "warning"];
	const quizOptClass = "my-2 btn-block";

	//Effects(s)
	useEffect(() => {
		if (timerRunning) {
			const targetDatetime =
				new Date().getTime() +
				timerMinutes * 60000 +
				timerSeconds * 1000;

			const interval = setInterval(() => {
				const distance = targetDatetime - new Date().getTime();
				const minutes = Math.floor(
					(distance % (60 * 60 * 1000)) / (1000 * 60)
				);
				const seconds = Math.ceil((distance % (60 * 1000)) / 1000);

				//Timer completed
				if (distance < 0) {
					setTimerMinutes(0);
					setTimerSeconds(0);

					setTimerStarted(false);
					setTimerRunning(false);

					setTimerReset(true);
					setTimerCompleted(true);

					clearInterval(interval.current);

					if (!bypassAPI) {
						fetch(
							"http://localhost:8080/api/endQuestion?sid=" + uuid
						)
							.then(async (response) => {
								const data = await response.json();

								//Check if response is not status 200
								if (!response.ok) {
									const error =
										(data && data.message) ||
										response.statusText;

									//Raise error
									setError(true);
									setErrorMsg(
										"API error: '/api/endQuestion'\n" +
											error
									);

									return Promise.reject(error);
								}
							})
							.catch((error) => {
								console.error(
									"API error: '/api/endQuestion'",
									error
								);
							});
					}
				}
				//Update timer display
				else {
					setTimerMinutes(minutes);
					setTimerSeconds(seconds);
				}
			}, 1000);

			//Clean up function for the useEffect
			return () => {
				clearInterval(interval);
			};
		}
	});

	//onClick handler(s)
	const selectQuizBtn_onClickHandler = (event) => {
		const targetQuizPos = event.target.value;
		const targetQuiz = quizData[targetQuizPos];
		const targetQuizQuestion = targetQuiz.questions[0];

		setQuizLastQuestion(targetQuiz.questions.length - 1);

		setTimerMinutes(targetQuizQuestion.timeMinutes);
		setTimerSeconds(targetQuizQuestion.timeSeconds);

		setQuizStarted(true);
		setQuizQuestioning(true);

		setTimerStarted(false);
		setTimerRunning(false);
		setTimerReset(false);

		setQuizSelected(targetQuiz);

		setQuizQuestionPos(0);
		setQuizQuestion(targetQuizQuestion);
	};
	const rtnQuizListBtn_onClickHandler = (event) => {
		setQuizStarted(false);
		setQuizQuestioning(false);

		setQuizSelected(null);

		setQuizQuestionPos(-1);
		setQuizQuestion(null);
	};
	const pausePlayBtn_onClickHandler = (event) => {
		setTimerRunning(!timerRunning);
	};
	const startStopBtn_onClickHandler = (event) => {
		//Reset Timer
		if (timerReset) {
			setTimerReset(false);
			setTimerCompleted(false);

			setTimerMinutes(quizQuestion.timeMinutes);
			setTimerSeconds(quizQuestion.timeSeconds);
		}

		//Start Timer
		if (!timerStarted) {
			//Lock button
			setLockstartTimerBtn(true);

			if (bypassAPI) {
				//Start timer
				setTimerStarted(true);
				setTimerRunning(true);

				//Unlock button
				setLockstartTimerBtn(false);
			} else {
				fetch("http://localhost:8080/api/startQuestion?sid=" + uuid)
					.then(async (response) => {
						const data = await response.json();

						//Check if response is not status 200
						if (!response.ok) {
							const error =
								(data && data.message) || response.statusText;

							//Raise error
							setError(true);
							setErrorMsg(
								"API error: '/api/startQuestion'\n" + error
							);

							return Promise.reject(error);
						} else {
							//Start timer
							setTimerStarted(true);
							setTimerRunning(true);
						}

						//Unlock button
						setLockstartTimerBtn(false);
					})
					.catch((error) => {
						console.error("API error: '/api/startQuestion'", error);

						//Raise error
						setError(true);
						setErrorMsg("API error: '/api/startQuestion'");

						//Unlock button
						setLockstartTimerBtn(false);
					});
			}
		}
		//End Timer
		else {
			setTimerStarted(false);
			setTimerRunning(false);

			setTimerMinutes(quizQuestion.timeMinutes);
			setTimerSeconds(quizQuestion.timeSeconds);
		}
	};
	const showResultsBtn_onClickHandler = (event) => {
		setQuizQuestioning(false);

		var link =
			"http://localhost:8080/api/questionResults?sid=" +
			uuid +
			"&minutes=" +
			quizQuestion.timeMinutes +
			"&seconds=" +
			quizQuestion.timeSeconds +
			"&score=" +
			quizQuestion.score +
			"&answer=" +
			quizQuestion.correctAns;
		console.log(link);

		fetch(link)
			.then(async (response) => {
				const data = await response.json();

				//Check if response is not status 200
				if (!response.ok) {
					const error = (data && data.message) || response.statusText;

					//Raise error
					setError(true);
					setErrorMsg("API error: '/api/questionResults'" + error);

					return Promise.reject(error);
				} else {
					setTimerStarted(true);
					setTimerRunning(false);
					setTimerReset(true);

					console.log(data.content);

					let newQuizResults = quizResults;
					for (let i = 0; i < data.content.length; i++) {
						if (data.content[i][0] in quizResults) {
							newQuizResults[data.content[i][0]] +=
								data.content[i][1];
						} else {
							newQuizResults[data.content[i][0]] =
								data.content[i][1];
						}
					}
					setQuizResults(newQuizResults);
				}

				//Unlock button
				setLockstartTimerBtn(false);
			})
			.catch((error) => {
				//Raise error
				setError(true);
				setErrorMsg("API error: '/api/questionResults' " + error);

				//Unlock button
				setLockstartTimerBtn(false);
			});

		return;
	};
	const nextQuestionBtn_onClickHandler = (event) => {
		const targetQuizPos = quizQuestionPos + 1;
		const targetQuizQuestion = quizSelected.questions[targetQuizPos];

		setTimerMinutes(targetQuizQuestion.timeMinutes);
		setTimerSeconds(targetQuizQuestion.timeSeconds);

		setQuizQuestioning(true);

		setTimerStarted(false);
		setTimerRunning(false);
		setTimerReset(false);
		setTimerCompleted(false);

		setQuizQuestionPos(targetQuizPos);
		setQuizQuestion(targetQuizQuestion);

		setQuizQuestioning(true);
	}

	//DOM Snippet(s)
	const QuizList = () => {
		return (
			<>
				{quizData.map((quiz, index) => (
					<Card key={index}>
						<Card.Body>
							<b>Title:</b> {quiz.name}
							<br />
							<b>Number of Questions:</b> {quiz.questions.length}
						</Card.Body>
						<Card.Footer>
							<Button
								variant="outline-primary"
								value={index}
								onClick={selectQuizBtn_onClickHandler}
							>
								Start Quiz
							</Button>
						</Card.Footer>
					</Card>
				))}
			</>
		);
	};
	const QuizQuestion = () => {
		return (
			<>
				<Card className="px-0 mx-0">
					<Card.Header>Timer</Card.Header>
					<Card.Body>
						<Row>
							<Col className="text-center text-muted">
								Minutes
							</Col>
							<Col xs={1} md={2}></Col>
							<Col className="text-center text-muted">
								Seconds
							</Col>
						</Row>
						<hr />
						<Row>
							<Col className="text-center display-3">
								{timerSeconds === 60
									? timerMinutes + 1 < 10
										? "0" + (timerMinutes + 1).toString()
										: timerMinutes + 1
									: timerMinutes < 10
									? "0" + timerMinutes.toString()
									: timerMinutes}
							</Col>
							<Col
								xs={1}
								md={2}
								className="text-center display-3"
							>
								:
							</Col>
							<Col className="text-center display-3">
								{timerSeconds < 10
									? "0" + timerSeconds.toString()
									: timerSeconds === 60
									? "00"
									: timerSeconds}
							</Col>
						</Row>
						<hr />
						<Row>
							<Col>
								<Button
									disabled={lockStartTimerBtn}
									variant={
										timerStarted
											? "outline-danger"
											: "outline-success"
									}
									className="btn-block"
									onClick={startStopBtn_onClickHandler}
								>
									{timerReset ? (
										<FiRepeat />
									) : timerStarted ? (
										<FaStop />
									) : (
										<FaPlay />
									)}
								</Button>
							</Col>
							<Col>
								<Button
									variant={
										timerStarted
											? timerRunning
												? "outline-primary"
												: "primary"
											: "outline-secondary"
									}
									className="btn-block"
									disabled={!timerStarted}
									onClick={pausePlayBtn_onClickHandler}
								>
									{timerStarted ? (
										timerRunning ? (
											<FaPause />
										) : (
											<FaPlay />
										)
									) : (
										<FaPause />
									)}
								</Button>
							</Col>
						</Row>
					</Card.Body>
				</Card>
				<br />
				<Card>
					<Card.Header>Question {quizQuestionPos + 1}</Card.Header>
					<Card.Body>
						<Row
							className="d-flex justify-content-center"
							style={{
								fontSize: "7vw"
							}}
						>
							{quizQuestion.question}
						</Row>
						<Row>
							<i className="d-flex justify-content-center text-muted">
								{quizQuestion.hint}
							</i>
						</Row>
						<hr />
						{quizQuestion.questionType === 0 ? (
							<QuizOpt4Tile />
						) : (
							<QuizOpt2Tile />
						)}
					</Card.Body>
					{timerCompleted ? (
						<Card.Footer>
							<Button
								variant="outline-secondary"
								className="btn-block"
								onClick={showResultsBtn_onClickHandler}
							>
								Show Results
							</Button>
						</Card.Footer>
					) : null}
				</Card>
			</>
		);
	};
	const QuizOpt4Tile = () => {
		return (
			<>
				<Row>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[0]}
						>
							<h3 className="my-2">{quizQuestion.options[0]}</h3>
							<br />
							<BsFillSquareFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[1]}
						>
							<h3 className="my-2">{quizQuestion.options[1]}</h3>
							<br />
							<BsFillCircleFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
				</Row>
				<Row>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[2]}
						>
							<h3 className="my-2">{quizQuestion.options[2]}</h3>
							<br />
							<BsFillTriangleFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[3]}
						>
							<h3 className="my-2">{quizQuestion.options[3]}</h3>
							<br />
							<BsFillPentagonFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
				</Row>
			</>
		);
	};
	const QuizOpt2Tile = () => {
		return (
			<>
				<Row>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[0]}
						>
							<h3 className="my-2">{quizQuestion.options[0]}</h3>
							<br />
							<BsFillSquareFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
					<Col>
						<Button
							size="lg"
							className={quizOptClass}
							variant={quizOptColor[1]}
						>
							<h3 className="my-2">{quizQuestion.options[1]}</h3>
							<br />
							<BsFillCircleFill
								className="my-2"
								style={{ fontSize: "4vw" }}
							/>
						</Button>
					</Col>
				</Row>
			</>
		);
	};
	const QuizResult = () => {
		return (
			<>
				<Card>
					<Card.Header>
						Question {quizQuestionPos + 1} Results
					</Card.Header>
					<ListGroup>
						{Object.entries(quizResults).map(([key, value]) => (
							<ListGroup.Item key={key}>
								{key}: {value}
							</ListGroup.Item>
						))}
					</ListGroup>
				</Card>
				<br />
				{quizQuestionPos === quizLastQuestion ? (
					<Button
						variant="outline-primary"
						className="btn-block"
						onClick={rtnQuizListBtn_onClickHandler}
					>
						Return to Quiz List
					</Button>
				) : (
					<Button
						variant="outline-primary"
						className="btn-block"
						onClick={nextQuestionBtn_onClickHandler}
					>
						Next Question
					</Button>
				)}
			</>
		);
	};
	const ErrorAlert = () => {
		return (
			<Alert variant="danger" onClose={() => setError(false)} dismissible>
				<Alert.Heading>Oopsie Woopsie!</Alert.Heading>
				<p>Error Encountered. {errorMsg}</p>
			</Alert>
		);
	};

	//Return component view
	return (
		<Container>
			<Row className="align-items-center">
				<Col className="align-items-center">
					<h1>
						{quizStarted ? (
							<Row>
								<Col className="align-items-center">
									<Button
										className="m-0"
										variant="outline-primary"
										onClick={rtnQuizListBtn_onClickHandler}
									>
										<IoMdArrowBack />
									</Button>
									<span className="mt-1 ms-3">
										{quizSelected.name}
									</span>
								</Col>
							</Row>
						) : (
							"Quiz List"
						)}
					</h1>
				</Col>
			</Row>
			{error ? (
				<>
					<br />
					<ErrorAlert />
				</>
			) : (
				<br />
			)}

			{!quizStarted ? (
				<QuizList />
			) : quizQuestioning ? (
				<QuizQuestion />
			) : (
				<QuizResult />
			)}
		</Container>
	);
};
export default Quiz;
