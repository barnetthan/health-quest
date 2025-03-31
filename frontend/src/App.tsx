import { BrowserRouter as Router, Routes, Route } from "react-router";
import 'bootstrap/dist/css/bootstrap.min.css';
import QuestPage from "./pages/QuestPage";
import GroupPage from "./pages/GroupPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import "./App.css";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/health-quest" element={<QuestPage />} />
          <Route path="/health-quest/profile" element={<ProfilePage />} />
          <Route path="/health-quest/group" element={<GroupPage />} />
        </Routes>
        <NavBar />
      </Router>
    </>
  );
}

export default App;
