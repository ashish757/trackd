import './App.css'
import './styles/custom.css'
import SigninPage from "./pages/SigninPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
// import Navbar from "./components/Navbar.tsx";

function App() {

  return (
      <>
          {/*<Navbar />*/}
          <main>
              <Routes>
                  <Route path="/" element={<ProtectedRoute authorized={<Home />} />} />
                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />
              </Routes>
          </main>
      </>

  )
}

export default App
