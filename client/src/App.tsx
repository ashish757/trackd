import './App.css'
import './styles/custom.css'
import LandingPage from "./pages/LandingPage.tsx";
import {Routes, Route} from "react-router-dom";
// import Navbar from "./components/Navbar.tsx";

function App() {

  return (
      <>
          {/*<Navbar />*/}
          <main>
              <Routes>
                  <Route path="/" element={<LandingPage />} />
              </Routes>
          </main>
      </>

  )
}

export default App
