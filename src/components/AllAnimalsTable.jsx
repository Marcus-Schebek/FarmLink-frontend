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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export default function AllAnimalsTable() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [lots, setLots] = useState({});
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [weightRange, setWeightRange] = useState([0, 600]);
  const [breedFilter, setBreedFilter] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productionFilter, setProductionFilter] = useState('all');

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token de autenticação não encontrado.');

        // 1. Busca animais
        const animalsResponse = await fetch('http://localhost:3000/animals', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!animalsResponse.ok) throw new Error('Falha ao buscar animais.');
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData);

        // 2. Lotes
        const lotIds = [...new Set(animalsData.map((a) => a.id_lot))];
        const lotDataArray = await Promise.all(
          lotIds.map((id) =>
            fetch(`http://localhost:3000/lots/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          )
        );
        const lotsMap = lotDataArray.reduce((acc, lot) => {
          acc[lot.id] = lot;
          return acc;
        }, {});
        setLots(lotsMap);

        // 3. Donos
        const ownerIds = [...new Set(animalsData.map((a) => a.id_owner))];
        const ownerDataArray = await Promise.all(
          ownerIds.map((id) =>
            fetch(`http://localhost:3000/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json())
          )
        );
        const ownersMap = ownerDataArray.reduce((acc, owner) => {
          acc[owner.id] = owner;
          return acc;
        }, {});
        setOwners(ownersMap);
      } catch (err) {
        console.error('Erro na busca:', err.message);
        setError('Falha ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [user]);

  // Aplicando filtros
  const filteredAnimals = animals.filter((animal) => {
    const matchesWeight =
      animal.current_weight >= weightRange[0] && animal.current_weight <= weightRange[1];

    const matchesBreed =
      breedFilter.trim() === '' ||
      animal.breed.toLowerCase().includes(breedFilter.toLowerCase());

    const matchesSex = sexFilter === 'all' || animal.sex === sexFilter;
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    const matchesProduction =
      productionFilter === 'all' || animal.production_objective === productionFilter;

    return matchesWeight && matchesBreed && matchesSex && matchesStatus && matchesProduction;
  });

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

return (
  <div className="p-4">
    {/* Filtros */}
    <div className="grid grid-cols-5 gap-4 mb-6">
      {/* Peso */}
      <div className="flex flex-col">
        <label className="block text-sm mb-1">Peso (kg)</label>
        <div className="w-full">
          <Slider
            value={weightRange}
            onValueChange={setWeightRange}
            min={0}
            max={2000}
            step={10}
          />
          <div className="flex justify-between text-xs mt-1">
            <span>{weightRange[0]} kg</span>
            <span>{weightRange[1]} kg</span>
          </div>
        </div>
      </div>

      {/* Raça */}
      <div className="flex flex-col">
        <label className="block text-sm mb-1">Raça</label>
        <Input
          className="w-full"
          placeholder="Buscar raça"
          value={breedFilter}
          onChange={(e) => setBreedFilter(e.target.value)}
        />
      </div>

      {/* Sexo */}
      <div className="flex flex-col">
        <label className="block text-sm mb-1">Sexo</label>
        <Select value={sexFilter} onValueChange={setSexFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="M">Macho</SelectItem>
            <SelectItem value="F">Fêmea</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label className="block text-sm mb-1">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
            <SelectItem value="saudavel">Saudável</SelectItem>
            <SelectItem value="doente">Doente</SelectItem>
            <SelectItem value="parida">Parida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Produção */}
      <div className="flex flex-col">
        <label className="block text-sm mb-1">Produção</label>
        <Select value={productionFilter} onValueChange={setProductionFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a produção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Corte">Corte</SelectItem>
            <SelectItem value="Leite">Leite</SelectItem>
            <SelectItem value="Misto">Misto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Tabela */}
    {filteredAnimals.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        Nenhum animal encontrado com os filtros aplicados.
      </div>
    ) : (
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
    )}
  </div>
);
}