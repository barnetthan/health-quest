import { LuFlag } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";
import { GoPerson } from "react-icons/go";
import { useNavigate } from "react-router";
import { useState } from "react";

function NavBar() {
  const navigate = useNavigate();
  const [curPath, setCurPath] = useState<string>("home");

  return (
    <>
      <div className="container">
        <div className="row navbar">
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              borderRight: "2px solid lightgray",
              color: curPath == "profile" ? "green" : "black",
            }}
          >
            <GoPerson
              onClick={() => {
                navigate("/health-quest/profile");
                setCurPath("profile");
              }}
              className="navbar-icon"
            />
          </div>
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              borderRight: "2px solid lightgray",
              color: curPath == "home" ? "green" : "black",
            }}
          >
            <LuFlag
              onClick={() => {
                navigate("/health-quest/");
                setCurPath("home");
              }}
              className="navbar-icon"
            />
          </div>
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              color: curPath == "group" ? "green" : "black",
            }}
          >
            <GrGroup
              onClick={() => {
                navigate("/health-quest/group");
                setCurPath("group");
              }}
              className="navbar-icon"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
