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
  earTag: z.string().min(2, { message: 'O identificador (brinco) deve ter no mínimo 2 caracteres.' }),
  breed: z.string().min(1, { message: 'A raça é obrigatória.' }),
  birthDate: z.date({
    required_error: 'A data de nascimento é obrigatória.',
  }),
  sex: z.enum(['Macho', 'Fêmea'], {
    required_error: 'O sexo é obrigatório.',
  }),
  currentWeight: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'O peso deve ser um número positivo.',
  }),
  status: z.string().optional(),
  productionObjective: z.string().min(1, { message: 'O tipo de produção é obrigatório.' }),
});

export default function RegisterAnimalForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      earTag: '',
      breed: '',
      birthDate: null,
      sex: '',
      currentWeight: '',
      status: 'Saudável',
      productionObjective: '',
    },
  });

  async function onSubmit(values) {
    // Mapeia os valores para o formato do banco de dados
    const submissionData = {
      ...values,
      sex: values.sex === 'Macho' ? 'M' : 'F',
      currentWeight: parseFloat(values.currentWeight),
    };

    console.log('Dados do animal prontos para envio:', submissionData);

    // Lógica para enviar para a sua API (exemplo)
    // try {
    //   const response = await fetch('http://localhost:3000/animals', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    //     },
    //     body: JSON.stringify({
    //       animal: {
    //         ear_tag: submissionData.earTag,
    //         breed: submissionData.breed,
    //         sex: submissionData.sex,
    //         birth_date: submissionData.birthDate,
    //         current_weight: submissionData.currentWeight,
    //         status: submissionData.status,
    //         production_objective: submissionData.productionObjective,
    //       }
    //     }),
    //   });
    //   // ... (tratamento da resposta)
    // } catch (error) {
    //   // ... (tratamento de erro)
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
              name="earTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador (Brinco)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brinco do animal" {...field} />
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
                name="sex"
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
                name="currentWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Atual (kg)</FormLabel>
                    <FormControl>
                      <Input placeholder="Peso em kg" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="productionObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Produção</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Corte">Corte</SelectItem>
                        <SelectItem value="Leite">Leite</SelectItem>
                        <SelectItem value="Misto">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status do animal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Saudável">Saudável</SelectItem>
                        <SelectItem value="Doente">Doente</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
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