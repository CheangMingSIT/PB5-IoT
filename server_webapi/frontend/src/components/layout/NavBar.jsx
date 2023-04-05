//Library imports
import { React } from "react";
import { Navbar, Button } from "react-bootstrap";

//Icon & images imports
import { AiOutlineBars } from "react-icons/ai";

//import css
import '../../App.css';

//Component initialization
const NavBar = (props) => {
	const toggleSideBar = props.toggleSideBar;

	return (
		<Navbar
			bg="dark"
			variant="dark"
			className="d-flex mx-0 px-0"
			style={{
				position: "fixed",
				right: "0",
				left: "0",
				zIndex: "10",
				color: "white"
			}}
		>
			<Button
				className="top_section mx-1"
				variant="outline-secondary"
				onClick={toggleSideBar}
			>
				<AiOutlineBars className="p-0 m-0" />
			</Button>

			<a href="/" 
				className="navbarBrandStyle"
				style={{
					color: "#FAF9F6"
				}}
			>
				CSC2006 - Internet Of Things
			</a>
		</Navbar >
	);
};

export default NavBar;
