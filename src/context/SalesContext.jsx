import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SalesContext = createContext();

export function SalesProvider({ children }) {
  const { user} = useAuth();
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken")

  useEffect(() => {
    async function fetchSalesData() {

      if (!user) {
        console.warn("⚠ Nenhum usuário autenticado");
        setError('Usuário não autenticado.');
        setLoading(false);
        return;
      }

      if (!token) {
        console.warn("⚠ Token não encontrado");
        setError('Token não encontrado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Buscar todas as vendas
        const res = await fetch('http://localhost:3000/sales', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        console.log("📡 Resposta status:", res.status);

        if (!res.ok) throw new Error('Erro ao buscar vendas');

        const allSalesData = await res.json();
        const salesList = Array.isArray(allSalesData) ? allSalesData : allSalesData.data || [];

        // 2️⃣ Filtrar vendas do usuário e buscar animais de cada venda
        const mySales = await Promise.all(
          salesList
            .filter(sale => sale.id_seller === user.id || sale.id_buyer === user.id)
            .map(async (sale) => {
              const animalsRes = await fetch(`http://localhost:3000/sale_animals?sale_id=${sale.id}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              });
              const animalsData = await animalsRes.json();

              return {
                ...sale,
                animals: animalsData, // adiciona array de animais à venda
              };
            })
        );

        setSales(mySales);
      } catch (err) {
        console.error("❌ Erro no fetchSalesData:", err);
        setError('Falha ao carregar vendas');
      } finally {
        setLoading(false);
      }
    }

    fetchSalesData();
  }, [user, token]);

  return (
    <SalesContext.Provider value={{ sales, loading, error }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales deve ser usado dentro de SalesProvider');
  }
  return context;
}
