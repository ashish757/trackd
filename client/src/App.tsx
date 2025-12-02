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
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import { useTokenRefreshOnLoad } from "./hooks/useTokenRefreshOnLoad.ts";
import FindUsers from "./pages/FindUsers.tsx";
import UserPage from "./pages/userPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ForgetPassword from "./pages/ForgetPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

function App() {
  // Automatically refresh access token on page load/reload
  const isRefreshingToken = useTokenRefreshOnLoad();

  // Show loading state while attempting to refresh token on page load
  if (isRefreshingToken) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <LoadingSpinner size="large" message="Restoring session..." />
      </div>
    );
  }

  return (
      <>
          <main>
              <Routes>
                  <Route path="/" element={<ProtectedRoute authorized={<Home />} />} />
                  <Route path="/discover" element={<ProtectedRoute authorized={<DiscoverPage />} />} />
                  <Route path="/my-list" element={<ProtectedRoute authorized={<MyListPage />} />} />
                  <Route path="/profile" element={<ProtectedRoute authorized={<ProfilePage />} />} />
                  <Route path="/settings" element={<ProtectedRoute authorized={<SettingsPage />} />} />
                  <Route path="/forget-password" element={<ForgetPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route path="/find" element={<FindUsers />} />
                  <Route path="/users/:username" element={<UserPage />} />

                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  <Route path="*" element={<NotFoundPage />} />
              </Routes>
          </main>
      </>

  )
}

export default App
