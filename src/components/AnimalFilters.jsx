import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export function AnimalFilters({
  weightRange,
  setWeightRange,
  breedFilter,
  setBreedFilter,
  sexFilter,
  setSexFilter,
  statusFilter,
  setStatusFilter,
  productionFilter,
  setProductionFilter,
}) {
  return (
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
  );
}