// src/components/RegisterAnimalForm.jsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';

// Esquema de validação com Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  breed: z.string().min(1, { message: 'A raça é obrigatória.' }),
  birthDate: z.date({
    required_error: 'A data de nascimento é obrigatória.',
  }),
  gender: z.enum(['Macho', 'Fêmea'], {
    required_error: 'O sexo é obrigatório.',
  }),
  weight: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'O peso deve ser um número positivo.',
  }),
});

export default function RegisterAnimalForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      breed: '',
      birthDate: null,
      gender: '',
      weight: '',
    },
  });

  async function onSubmit(values) {
    // Mapeia o valor de 'gender' para o formato esperado pelo backend
    const genderValue = values.gender === 'Macho' ? 'M' : 'F';
    const submissionData = {
      ...values,
      gender: genderValue,
      weight: parseFloat(values.weight),
    };

    console.log('Dados do animal prontos para envio:', submissionData);

    // O restante da sua lógica de envio para a API (descomentada e adaptada)
    // try {
    //   const response = await fetch('http://localhost:3000/api/animals', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    //     },
    //     body: JSON.stringify({
    //       animal: {
    //         name: submissionData.name,
    //         breed: submissionData.breed,
    //         birth_date: submissionData.birthDate,
    //         gender: submissionData.gender,
    //         weight: submissionData.weight,
    //       }
    //     }),
    //   });
    //   if (!response.ok) {
    //     throw new Error('Falha no cadastro do animal.');
    //   }
    //   console.log('Animal cadastrado com sucesso!');
    //   form.reset();
    // } catch (error) {
    //   console.error(error.message);
    // }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Cadastrar Animal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do animal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça</FormLabel>
                  <FormControl>
                    <Input placeholder="Raça do animal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={`w-full justify-start text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                        >
                          <FaCalendarAlt className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Escolha uma data</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Macho">Macho</SelectItem>
                        <SelectItem value="Fêmea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input placeholder="Peso em kg" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Cadastrar Animal
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}