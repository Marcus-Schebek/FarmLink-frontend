import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NOVO ESTADO DE CARREGAMENTO
  const navigate = useNavigate();

  // Efeito para verificar o token no localStorage ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Se houver um token, o usuário está autenticado
      setIsAuthenticated(true);
      // Aqui você poderia fazer uma requisição para obter os dados do usuário, se necessário
    }
    // Mude o estado de loading para false após a verificação
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha na autenticação.');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      setIsAuthenticated(true);
      setUser(data.user);
      navigate('/dashboard');
      return { success: true };

    } catch (error) {
      console.error('Erro no login:', error.message);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  // Se ainda estiver carregando, mostre uma tela de espera
  if (loading) {
    return <div>Loading...</div>; // Você pode substituir por um spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};