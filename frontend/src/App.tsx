import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import QuestPage from "./pages/QuestPage";
import GroupPage from "./pages/GroupPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ height: "90vh", overflowY: "scroll" }}>
        <Routes>
          <Route path="/health-quest/login" element={<Login />} />
          <Route
            path="/health-quest/"
            element={
              <PrivateRoute>
                <QuestPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/health-quest/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/health-quest/group"
            element={
              <PrivateRoute>
                <GroupPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      {currentUser && <NavBar />}
    </Router>
  );
}

export default App;
