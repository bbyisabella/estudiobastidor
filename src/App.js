import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cliente from './pages/Cliente';
import NovoCliente from './pages/NovoCliente';
import Demandas from './pages/Demandas';
import Calendario from './pages/Calendario';
import Equipe from './pages/Equipe';

function RotaProtegida({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
          <Route path="/clientes/novo" element={<RotaProtegida><NovoCliente /></RotaProtegida>} />
          <Route path="/clientes/:id" element={<RotaProtegida><Cliente /></RotaProtegida>} />
          <Route path="/demandas" element={<RotaProtegida><Demandas /></RotaProtegida>} />
          <Route path="/calendario" element={<RotaProtegida><Calendario /></RotaProtegida>} />
          <Route path="/equipe" element={<RotaProtegida><Equipe /></RotaProtegida>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
