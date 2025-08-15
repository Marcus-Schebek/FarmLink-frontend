import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Efeito para verificar o token no localStorage ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Nota: Em um ambiente de produção, você faria uma requisição para validar o token no backend
      // Por enquanto, vamos assumir que a existência do token significa que o usuário está autenticado
      setIsAuthenticated(true);
      // Você poderia decodificar o token para obter dados do usuário se necessário
    }
  }, []);

  // Função de Login que será chamada do LoginForm
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
      localStorage.setItem('authToken', data.token); // Armazene o token JWT
      setIsAuthenticated(true);
      setUser(data.user);
      navigate('/dashboard'); // Redireciona após o sucesso
      return { success: true };

    } catch (error) {
      console.error('Erro no login:', error.message);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  // Função de Logout
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};