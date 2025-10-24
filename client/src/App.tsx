import './App.css'
import './styles/custom.css'
import LandingPage from "./pages/LandingPage.tsx";
import SigninPage from "./pages/SigninPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import {Routes, Route} from "react-router-dom";
// import Navbar from "./components/Navbar.tsx";

function App() {

  return (
      <>
          {/*<Navbar />*/}
          <main>
              <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />
              </Routes>
          </main>
      </>

  )
}

export default App
