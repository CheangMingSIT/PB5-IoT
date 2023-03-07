import { React } from "react";
import { Nav } from "react-bootstrap";

const SideBar = (props) => {
	return (
		<>
			<Nav
				className="col-md-12 p-3 d-none d-md-block bg-light sidebar"
				activeKey="/home"
				onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
			>
				<div className="sidebar-sticky"></div>

				<Nav.Item>
					<a className="btn font-weight-bold" href="/">
						Main
					</a>
				</Nav.Item>
			</Nav>
		</>
	);
};
export default SideBar;
