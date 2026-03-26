import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignIn from "./pages/sign_in";
import SignUp from "./pages/sign_up";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<div>Dashboard coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}