import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SoundcraftFull from './pages/SoundcraftFull';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/soundcraft" element={<SoundcraftFull />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
