import './App.css';
import React from "react"
import { Route, Routes } from "react-router-dom";
import SearchPage from './pages/search/searchpage';
import LeafletPage from './pages/map/leaflet';
import Trial from './pages/trial/trial';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage/>}/>
      <Route path="/search" element={<SearchPage/>}/>
      <Route path='/map' element={<LeafletPage/>}></Route>
      <Route path='/trial' element={<Trial></Trial>}></Route>
    </Routes>
  );
}

export default App;
