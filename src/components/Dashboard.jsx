import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaMoneyBillWave, FaChartLine, FaThermometerHalf } from 'react-icons/fa';
import { GiCow } from "react-icons/gi";

// Componente para os Cartões de Resumo
const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className="flex items-center justify-between p-6">
      <div>
        <CardTitle className="text-sm font-semibold text-gray-500">{title}</CardTitle>
        <CardContent className="p-0 mt-1">
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </div>
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

const Dashboard = () => {
  // Dados de exemplo para os cartões de resumo
  const stats = [
    { title: 'Total de Animais', value: '1.245', icon: GiCow, color: 'blue' },
    { title: 'Vendas do Mês', value: 'R$ 250.000', icon: FaMoneyBillWave, color: 'green' },
    { title: 'Ganho de Peso Médio', value: '0.8 kg/dia', icon: FaChartLine, color: 'purple' },
    { title: 'Alertas de Saúde', value: '3', icon: FaThermometerHalf, color: 'red' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Sidebar de Navegação */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
        <h1 className="text-xl text-green-500 font-bold mb-6">FarmLink</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start text-left">
                Dashboard
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-left">
                Animais
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-left">
                Medicamentos
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start text-left">
                Vendas
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        
        {/* Seção de Cartões de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Placeholder para os Gráficos */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm h-[400px] flex items-center justify-center text-xl font-bold text-gray-400">
          Área para Gráficos e Tabelas
        </div>
      </main>
    </div>
  );
};

export default Dashboard;