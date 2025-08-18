import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export function AnimalsTable({ animals, owners, onDeleteAnimal, showActions = false, showOwners = false }) {
  return (
    <div className="mt-8 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brinco</TableHead>
            <TableHead>Raça</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Produção</TableHead>
            {showOwners && (
              <>
                <TableHead>Dono</TableHead>
                <TableHead>Contato</TableHead>
              </>
            )}
            {showActions && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.ear_tag}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>{new Date(animal.birth_date).toLocaleDateString()}</TableCell>
              <TableCell>{animal.sex === 'M' ? 'Macho' : 'Fêmea'}</TableCell>
              <TableCell>{animal.current_weight} kg</TableCell>
              <TableCell>{animal.status}</TableCell>
              <TableCell>{animal.production_objective}</TableCell>
              {showOwners && (
              <>
              <TableCell>{owners[animal.id_owner]?.name || '—'}</TableCell>
              <TableCell>{owners[animal.id_owner]?.phone || '—'}</TableCell>
              </>
            )}
              {showActions && (
                <TableCell className="text-right">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteAnimal(animal.id)}
                  >
                    Remover Animal
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}