//Library imports
import { React } from "react";

//Library component imports
import { NavLink } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

//Icon & images imports
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineQuiz } from "react-icons/md";

//Component initialization
const SideBar = ({ children, showSideBar, toggleSideBar }) => {
	const menuItems = [
		{
			path: "/",
			name: "Main",
			icon: <AiOutlineHome />
		},
		{
			path: "/quiz",
			name: "Quiz",
			icon: <MdOutlineQuiz />
		}
	];

	return (
		<div className="sidebar-wrapper">
			<div
				className="sidebar"
				style={{ width: showSideBar ? "250px" : "0px" }}
			>
				{menuItems.map((item, index) => (
					<NavLink
						to={item.path}
						key={index}
						className="link"
						activeclassname="active"
						onClick={toggleSideBar}
						style={{ display: showSideBar ? "block" : "none" }}
					>
						<Row>
							<Col className="icon" sm={2}>
								{item.icon}
							</Col>
							<Col className="link_text" sm={8}>
								{item.name}
							</Col>
						</Row>
					</NavLink>
				))}
			</div>
			<main>{children}</main>
		</div>
	);
};

export default SideBar;
