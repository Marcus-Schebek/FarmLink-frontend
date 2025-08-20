import React, { useEffect, useState } from "react";
import { useSales } from "../context/SalesContext";
import { useAuth } from "../context/AuthContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MySalesTable() {
  const { user } = useAuth();
  const { sales, loading, error } = useSales();
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!sales || sales.length === 0) return;

    const fetchSalesDetails = async () => {
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
          // Buscar animais
          const animals = await Promise.all(
             (sale.animals || []).map(async (sale_animal) => {
              const res = await fetch(`http://localhost:3000/animals/${sale_animal.id_animal}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              console.log("Animal fetched:", data);
              return data;
            })
          );
          // Buscar vendedor
          const sellerRes = await fetch(`http://localhost:3000/users/${sale.id_seller}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sellerData = await sellerRes.json();

          // Buscar comprador
          const buyerRes = await fetch(`http://localhost:3000/users/${sale.id_buyer}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const buyerData = await buyerRes.json();

          return {
            ...sale,
            animals,
            seller_name: sellerData.name,
            buyer_name: buyerData.name,
          };
        })
      );

      setSalesData(salesWithDetails);
    };

    fetchSalesDetails();
  }, [sales]);

  if (loading) return <div className="p-8 text-center">Carregando vendas...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Vendas e Compras</CardTitle>
      </CardHeader>
      <CardContent>
        {salesData.length === 0 ? (
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
              {salesData.map((sale) => (
                <TableRow key={sale.id_sale}>
                  <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.id_seller === user.id_user ? "Você" : sale.seller_name}</TableCell>
                  <TableCell>{sale.id_buyer === user.id_user ? "Você" : sale.buyer_name}</TableCell>
                  <TableCell>{sale.payment_method}</TableCell>
                  <TableCell>
                    R$ {sale.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {sale.animals?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {sale.animals.map((animal) => (
                          <Badge key={animal.id_animal} variant="secondary">
                            {animal.ear_tag}
                          </Badge>
                        ))}
                      </div>
                    ) : "N/A"}
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
