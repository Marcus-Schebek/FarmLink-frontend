import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import { AuthProvider } from './context/AuthContext';import ProtectedRoute from './components/ProtectedRoute';
import {MyAnimalsProvider} from './context/MyAnimalsContext';
import { DietProvider } from './context/MyDietsContext';
import { SalesProvider } from './context/SalesContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MyAnimalsProvider>
          <SalesProvider>
          <DietProvider>
          <Routes>
          {/* Rotas Públicas */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          {/* Rota Protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
            />
        </Routes>
            </DietProvider>
          </SalesProvider>
        </MyAnimalsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);