import './App.css'
import './styles/custom.css'
import SigninPage from "./pages/SigninPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home.tsx";
import DiscoverPage from "./pages/DiscoverPage.tsx";
import MyListPage from "./pages/MyListPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

function App() {

  return (
      <>
          <main>
              <Routes>
                  <Route path="/" element={<ProtectedRoute authorized={<Home />} />} />
                  <Route path="/discover" element={<ProtectedRoute authorized={<DiscoverPage />} />} />
                  <Route path="/my-list" element={<ProtectedRoute authorized={<MyListPage />} />} />
                  <Route path="/profile" element={<ProtectedRoute authorized={<ProfilePage />} />} />
                  <Route path="/settings" element={<ProtectedRoute authorized={<SettingsPage />} />} />
                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />
              </Routes>
          </main>
      </>

  )
}

export default App
