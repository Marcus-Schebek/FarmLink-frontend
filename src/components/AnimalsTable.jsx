// src/components/AnimalsTable.jsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

export function AnimalsTable({ animals, lots, owners }) {
  if (animals.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum animal encontrado com os filtros aplicados.
      </div>
    );
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