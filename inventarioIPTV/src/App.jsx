import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AddInventario from './components/AddInventario';
import DeleteInventario from './components/DeleteInventario';
import InventarioList from './components/InventarioList';
import Layout from './components/Layout';
import UpdateInventario from './components/UpdateInventario';
import UploadFile from './components/UploadFile';

function App() {
  return (
    <Router>
      <Layout>
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<InventarioList />} />
            <Route path="/add" element={<AddInventario />} />
            <Route path="/update" element={<UpdateInventario />} />
            <Route path="/delete" element={<DeleteInventario />} />
            <Route path="/upload" element={<UploadFile />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
