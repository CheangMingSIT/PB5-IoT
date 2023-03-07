import React from "react";
import { Container, Navbar } from "react-bootstrap";

const HeaderBar = (props) => {
	return (
		<Navbar bg="dark" variant="dark" className="d-flex mx-0 px-0">
			<Container className="m-0 px-3">
				<Navbar.Brand href="#home">CSC2008 - Internet Of Things</Navbar.Brand>
			</Container>
		</Navbar>
	);
}

export default HeaderBar; 