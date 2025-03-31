import { LuFlag } from "react-icons/lu";
import { GrGroup } from "react-icons/gr";
import { GoPerson } from "react-icons/go";
import { useLocation, useNavigate } from "react-router";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path_regex = /\/health-quest\/(\w+)/; // Regex to extract path

  return (
    <>
      <div className="container">
        <div className="row navbar">
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              borderRight: "2px solid lightgray",
              color:
                location.pathname.match(path_regex)?.[1] == "profile"
                  ? "green"
                  : "black",
            }}
          >
            <GoPerson
              onClick={() => {
                navigate("/health-quest/profile");
              }}
              className="navbar-icon"
            />
          </div>
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              borderRight: "2px solid lightgray",
              color: location.pathname == "/health-quest/" ? "green" : "black",
            }}
          >
            <LuFlag
              onClick={() => {
                navigate("/health-quest/");
              }}
              className="navbar-icon"
            />
          </div>
          <div
            className="col-4 text-center navbar-icon-container"
            style={{
              color:
                location.pathname.match(path_regex)?.[1] == "group"
                  ? "green"
                  : "black",
            }}
          >
            <GrGroup
              onClick={() => {
                navigate("/health-quest/group");
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
