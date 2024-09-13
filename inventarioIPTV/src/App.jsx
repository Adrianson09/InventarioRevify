import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AddInventario from './components/AddInventario';
import DeleteInventario from './components/DeleteInventario';
import InventarioList from './components/InventarioList';
import Layout from './components/Layout';
import UpdateInventario from './components/UpdateInventario';
import UploadFile from './components/UploadFile';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={<PrivateRoute element={<InventarioList />} requiredRoles={['soporte', 'admin']} />} 
              />
              <Route 
                path="/add" 
                element={<PrivateRoute element={<AddInventario />} requiredRoles={['admin']} />} 
              />
              <Route 
                path="/update" 
                element={<PrivateRoute element={<UpdateInventario />} requiredRoles={['admin']} />} 
              />
              <Route 
                path="/delete" 
                element={<PrivateRoute element={<DeleteInventario />} requiredRoles={['admin']} />} 
              />
              <Route 
                path="/upload" 
                element={<PrivateRoute element={<UploadFile />} requiredRoles={['admin']} />} 
              />
            </Routes>
          </div>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
