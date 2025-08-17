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
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const formSchema = z.object({
  earTag: z.string().min(1, "Brinco é obrigatório"),
  breed: z.string().min(1, "Raça é obrigatória"),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  sex: z.enum(["Macho", "Fêmea"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  currentWeight: z
    .string()
    .min(1, "Peso é obrigatório")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Peso deve ser numérico",
    }),
  status: z.enum(["Saudável", "Doente", "Vendido", "Outro"], {
    errorMap: () => ({ message: "Selecione o status" }),
  }),
  productionObjective: z.enum(["Corte", "Leite", "Misto"], {
    errorMap: () => ({ message: "Selecione o objetivo de produção" }),
  }),
});

export default function RegisterAnimalForm() {
  const { user } = useAuth(); 
  const token = localStorage.getItem('authToken');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      earTag: '',
      breed: '',
      birthDate: undefined,
      sex: undefined,
      currentWeight: '',
      status: 'Saudável',
      productionObjective: undefined,
    },
  });

  async function onSubmit(values) {
    if (!user || !token) {
      toast.error('Erro de autenticação', {
        description: 'Usuário não autenticado ou token ausente. Faça login novamente.',
      });
      return;
    }

    try {
      const submissionData = {
        ear_tag: values.earTag,
        breed: values.breed,
        sex: values.sex === 'Macho' ? 'M' : 'F',
        birth_date: values.birthDate
          ? values.birthDate.toISOString().split('T')[0]
          : null,
        current_weight: parseFloat(values.currentWeight),
        status: values.status,
        production_objective: values.productionObjective,
        id_owner: user.id, 
        id_lot: 1,
      };

      const response = await fetch('http://localhost:3000/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar o animal.');
      }

      toast.success('Animal Cadastrado', {
        description: `O animal com brinco ${values.earTag} foi cadastrado com sucesso.`,
      });

      form.reset();
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro no Cadastro', {
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Cadastrar Animal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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