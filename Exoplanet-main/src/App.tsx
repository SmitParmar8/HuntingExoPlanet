import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Starfield } from './components/Starfield';
import { Dashboard } from './pages/Dashboard';
import { Specifications } from './pages/Specifications';
import { History } from './pages/History';
import { Explorer } from './pages/Explorer';
import { Learning } from './pages/Learning';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-x-hidden">
        <Starfield />
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/specifications" element={<Specifications />} />
            <Route path="/history" element={<History />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/learning" element={<Learning />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
