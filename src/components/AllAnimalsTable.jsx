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
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    minWeight: '',
    breed: '',
    production: '',
    sex: '',
    status: '',
  });

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token de autenticação não encontrado.');

        // 1. Busca todos os animais
        const animalsResponse = await fetch('http://localhost:3000/animals', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!animalsResponse.ok) throw new Error('Falha ao buscar animais.');
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData);

        // 2. Busca lotes
        const lotIds = [...new Set(animalsData.map(a => a.id_lot))];
        const lotPromises = lotIds.map(id =>
          fetch(`http://localhost:3000/lots/${id}`, {
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

        // 3. Busca donos
        const ownerIds = [...new Set(animalsData.map(a => a.id_owner))];
        const ownerPromises = ownerIds.map(id =>
          fetch(`http://localhost:3000/users/${id}`, {
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

      } catch (err) {
        console.error('Erro na busca de dados:', err.message);
        setError('Falha ao carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [user]);

  // Função de filtragem
  const filteredAnimals = animals.filter(animal => {
    if (filters.minWeight && animal.current_weight < Number(filters.minWeight)) return false;
    if (filters.breed && animal.breed !== filters.breed) return false;
    if (filters.production && animal.production_objective !== filters.production) return false;
    if (filters.sex && animal.sex !== filters.sex) return false;
    if (filters.status && animal.status !== filters.status) return false;
    return true;
  });

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (animals.length === 0) return <div className="p-8 text-center text-gray-500">Nenhum animal cadastrado no sistema.</div>;

  return (
    <div className="p-4">
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <input
          type="number"
          placeholder="Peso mínimo"
          value={filters.minWeight}
          onChange={e => setFilters({ ...filters, minWeight: e.target.value })}
          className="border rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Raça"
          value={filters.breed}
          onChange={e => setFilters({ ...filters, breed: e.target.value })}
          className="border rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Produção"
          value={filters.production}
          onChange={e => setFilters({ ...filters, production: e.target.value })}
          className="border rounded-lg p-2"
        />
        <select
          value={filters.sex}
          onChange={e => setFilters({ ...filters, sex: e.target.value })}
          className="border rounded-lg p-2"
        >
          <option value="">Sexo</option>
          <option value="M">Macho</option>
          <option value="F">Fêmea</option>
        </select>
        <input
          type="text"
          placeholder="Status"
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg p-2"
        />
      </div>

      {/* Tabela */}
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
            {filteredAnimals.map((animal) => {
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
    </div>
  );
}
