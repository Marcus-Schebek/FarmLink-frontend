import React, { useState } from "react";
import { useAnimals } from "../context/MyAnimalsContext";
import { AnimalFilters } from "@/components/AnimalFilters";
import { AnimalsTable } from "@/components/AnimalsTable";

export default function MyAnimalsTable() {
  const { animals, owners, loading, error, deleteAnimal } = useAnimals();

  // Filtros locais
  const [weightRange, setWeightRange] = useState([0, 2000]);
  const [breedFilter, setBreedFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productionFilter, setProductionFilter] = useState("all");

  // Aplicando filtros
  const filteredAnimals = animals.filter((animal) => {
    const matchesWeight =
      animal.current_weight >= weightRange[0] &&
      animal.current_weight <= weightRange[1];
    const matchesBreed =
      breedFilter.trim() === "" ||
      animal.breed.toLowerCase().includes(breedFilter.toLowerCase());
    const matchesSex = sexFilter === "all" || animal.sex === sexFilter;
    const matchesStatus =
      statusFilter === "all" || animal.status === statusFilter;
    const matchesProduction =
      productionFilter === "all" ||
      animal.production_objective === productionFilter;

    return (
      matchesWeight &&
      matchesBreed &&
      matchesSex &&
      matchesStatus &&
      matchesProduction
    );
  });

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
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

      <AnimalsTable
        animals={filteredAnimals}
        owners={owners}
        onDeleteAnimal={deleteAnimal}
        isAllAnimals={false}
      />
    </div>
  );
}
