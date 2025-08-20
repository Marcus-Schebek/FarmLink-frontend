import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimalFilters } from '@/components/AnimalFilters'; 
import { AnimalsTable } from '@/components/AnimalsTable';   

export default function AllAnimalsTable() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [weightRange, setWeightRange] = useState([0, 2000]);
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
      {/* Componente de Filtros */}
      <AnimalFilters
        weightRange={weightRange}
        setWeightRange={setWeightRange}
        breedFilter={breedFilter}
        setBreedFilter={setBreedFilter}
        sexFilter={sexFilter}
        setSexFilter={setSexFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        productionFilter={productionFilter}
        setProductionFilter={setProductionFilter}
      />
      
      {/* Componente de Tabela */}
      <AnimalsTable
        animals={filteredAnimals}
        owners={owners}
        showOwners={true}
        isAllAnimals={true}
      />
    </div>
  );
}