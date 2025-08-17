import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função auxiliar para buscar os dados do usuário a partir da API
  const fetchUserData = async (token, userId) => {
    try {
      if (!token || !userId) {
        throw new Error('Token ou ID do usuário não fornecido.');
      }

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar dados do usuário.');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro na autenticação:', error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Efeito para verificar o token e carregar o usuário no início
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // Armazenar e pegar o ID também
    
    if (token && userId) {
      fetchUserData(token, userId);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
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
      localStorage.setItem('userId', data.user_id); // Armazena o ID explicitamente

      await fetchUserData(data.token, data.user_id);
      
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error.message);
      setIsAuthenticated(false);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};