import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MySalesTable() {
  // Pega o user E o loading do contexto
  const { user, loading: authLoading } = useAuth();
  const [sales, setSales] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSalesData() {
      // Se o user ainda está sendo carregado, não faz nada
      if (authLoading) return;

      // Se o user está nulo (não autenticado), mostra um erro
      if (!user) {
        setTableLoading(false);
        setError('Usuário não autenticado.');
        return;
      }

      setTableLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Token de autenticação não encontrado.');
        setTableLoading(false);
        return;
      }

      try {
        const salesResponse = await fetch('http://localhost:3000/sales', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!salesResponse.ok) throw new Error('Falha ao buscar as vendas.');
        const allSalesData = await salesResponse.json();

        const mySales = allSalesData.filter(
          (sale) => sale.id_seller === user.id_user || sale.id_buyer === user.id_user
        );

        const salesWithDetails = await Promise.all(
          mySales.map(async (sale) => {
            const isSeller = sale.id_seller === user.id_user;
            
            const buyerData = isSeller
              ? await (await fetch(`http://localhost:3000/users/${sale.id_buyer}`, { headers: { Authorization: `Bearer ${token}` }})).json()
              : user;

            const sellerData = !isSeller
              ? await (await fetch(`http://localhost:3000/users/${sale.id_seller}`, { headers: { Authorization: `Bearer ${token}` }})).json()
              : user;

            const animalsResponse = await fetch(`http://localhost:3000/sale_animals/sale/${sale.id_sale}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const animalsData = animalsResponse.ok ? await animalsResponse.json() : [];

            return {
              ...sale,
              buyer_name: buyerData?.name || 'Comprador Desconhecido',
              buyer_phone: buyerData?.phone || 'N/A',
              seller_name: sellerData?.name || 'Vendedor Desconhecido',
              animals: animalsData,
            };
          })
        );
        setSales(salesWithDetails);
      } catch (err) {
        console.error('Erro na busca de vendas:', err);
        setError('Falha ao carregar as vendas.');
      } finally {
        setTableLoading(false);
      }
    }

    fetchSalesData();
  }, [user, authLoading]); // Adiciona authLoading como dependência

  // Se o contexto ainda estiver carregando, exibe uma mensagem de carregamento
  if (authLoading) {
    return <div className="p-8 text-center">Carregando dados do usuário...</div>;
  }

  // Exibe o estado de carregamento da tabela separadamente
  if (tableLoading) {
    return <div className="p-8 text-center">Carregando vendas...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Vendas e Compras</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma venda ou compra encontrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Animais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id_sale}>
                  <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {sale.id_seller === user.id_user ? 'Você' : sale.seller_name}
                  </TableCell>
                  <TableCell>
                    {sale.id_buyer === user.id_user ? 'Você' : sale.buyer_name}
                  </TableCell>
                  <TableCell>{sale.payment_method}</TableCell>
                  <TableCell>
                    R$ {sale.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {sale.animals.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {sale.animals.map((animal) => (
                          <Badge key={animal.id_animal} variant="secondary">
                            {animal.ear_tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}