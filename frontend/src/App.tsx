import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import QuestPage from "./pages/QuestPage";
import GroupPage from "./pages/GroupPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/health-quest/login" 
            element={!currentUser ? <Login /> : <Navigate to="/health-quest" />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/health-quest" 
            element={currentUser ? <QuestPage /> : <Navigate to="/health-quest/login" />} 
          />
          <Route 
            path="/health-quest/profile" 
            element={currentUser ? <ProfilePage /> : <Navigate to="/health-quest/login" />} 
          />
          <Route 
            path="/health-quest/group" 
            element={currentUser ? <GroupPage /> : <Navigate to="/health-quest/login" />} 
          />
          
          {/* Redirect any unknown routes to main page */}
          <Route path="*" element={<Navigate to="/health-quest" />} />
        </Routes>
        {currentUser && <NavBar />}
      </Router>
    </>
  );
}

export default App;