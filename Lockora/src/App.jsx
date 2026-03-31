import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignIn from "./pages/sign_in";
import SignUp from "./pages/sign_up";
import UnlockVault from "./pages/UnlockVault";
import Dashboard from "./pages/Dashboard";
import SharePage from "./pages/SharePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/signin"    element={<SignIn />} />
        <Route path="/signup"    element={<SignUp />} />
        <Route path="/unlock"    element={<UnlockVault />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/share/:id" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  );
}