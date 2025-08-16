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
import { format } from 'date-fns';

export default function AllAnimalsTable() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [lots, setLots] = useState({});
  const [owners, setOwners] = useState({}); // Novo estado para os donos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        // 1. Busca todos os animais
        const animalsResponse = await fetch('http://localhost:3000/animals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!animalsResponse.ok) {
          throw new Error('Falha ao buscar animais.');
        }
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData);

        // 2. Extrai IDs únicos de lotes e donos
        const lotIds = [...new Set(animalsData.map(animal => animal.id_lot).filter(Boolean))];
        const ownerIds = [...new Set(animalsData.map(animal => animal.id_owner).filter(Boolean))];

        // 3. Busca lotes
        const lotPromises = lotIds.map(id =>
          fetch(`http://localhost:3000/lots/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }).then(res => res.json())
        );
        const lotDataArray = await Promise.all(lotPromises);
        const lotsMap = lotDataArray.reduce((acc, lot) => {
          acc[lot.id] = lot;
          return acc;
        }, {});
        setLots(lotsMap);

        // 4. Busca donos
        const ownerPromises = ownerIds.map(id =>
          fetch(`http://localhost:3000/users/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }).then(res => res.json())
        );
        const ownerDataArray = await Promise.all(ownerPromises);
        const ownersMap = ownerDataArray.reduce((acc, owner) => {
          acc[owner.id] = owner;
          return acc;
        }, {});
        setOwners(ownersMap);

        console.log('Dados de lotes:', lotsMap);
        console.log('Dados de donos:', ownersMap);

      } catch (err) {
        console.error('Erro na busca de dados:', err.message);
        setError('Falha ao carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (animals.length === 0) {
    return <div className="p-8 text-center text-gray-500">Nenhum animal cadastrado no sistema.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador</TableHead>
            <TableHead>Raça</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Peso Atual</TableHead>
            <TableHead>Produção</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dono</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Fazenda</TableHead>
            <TableHead>Lote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => {
            const lotInfo = lots[animal.id_lot];
            const ownerInfo = owners[animal.id_owner];
            return (
              <TableRow key={animal.id}>
                <TableCell className="font-medium">{animal.ear_tag}</TableCell>
                <TableCell>{animal.breed}</TableCell>
                <TableCell>{format(new Date(animal.birth_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{animal.sex === 'M' ? 'Macho' : 'Fêmea'}</TableCell>
                <TableCell>{animal.current_weight} kg</TableCell>
                <TableCell>{animal.production_objective}</TableCell>
                <TableCell>{animal.status}</TableCell>
                <TableCell>{ownerInfo?.name || 'N/A'}</TableCell>
                <TableCell>{ownerInfo?.phone || 'N/A'}</TableCell>
                <TableCell>{lotInfo?.origin_location || 'N/A'}</TableCell>
                <TableCell>{lotInfo?.id || 'N/A'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
