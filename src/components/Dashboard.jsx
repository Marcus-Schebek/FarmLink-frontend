import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FaPaw,
  FaMoneyBillWave,
  FaChartLine,
  FaThermometerHalf,
  FaSignOutAlt,
  FaPlus,
  FaStethoscope,
  FaShoppingCart,
  FaUtensils,
  FaClipboardList,
  FaHome,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import RegisterAnimalForm from './RegisterAnimalForm'; // Importação correta

// --- COMPONENTES DE PLACEHOLDER ---
const DashboardContent = () => <div className="p-8">Dashboard Overview</div>;
const MyAnimalsList = () => <div className="p-8">Lista dos Meus Animais</div>;
const MyMedicines = () => <div className="p-8">Seção de Meus Medicamentos</div>;
const MySales = () => <div className="p-8">Seção de Minhas Vendas</div>;
const MyDiets = () => <div className="p-8">Seção de Minhas Dietas</div>;
const AllAnimals = () => <div className="p-8">Tabela de Todos os Animais</div>;
const AllFarms = () => <div className="p-8">Tabela de Todas as Fazendas</div>;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'my_animals_list':
        return <MyAnimalsList />;
      case 'register_animal_form':
        return <RegisterAnimalForm />; // Usando o componente importado
      case 'my_medicines':
        return <MyMedicines />;
      case 'my_sales':
        return <MySales />;
      case 'my_diets':
        return <MyDiets />;
      case 'all_animals':
        return <AllAnimals />;
      case 'all_farms':
        return <AllFarms />;
      default:
        return <MyAnimalsList />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-1">FarmLink</h1>
        {user && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Bem-vindo, {user.name}!
          </p>
        )}
        
        <nav className="flex-1 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Minhas Informações</h2>
            <ul className="space-y-2">
              <li>
                <Button 
                  variant={activeView === 'my_animals_list' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('my_animals_list')}
                  className="w-full justify-start text-left"
                >
                  <FaPaw className="mr-2" /> Meus Animais
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeView === 'register_animal_form' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('register_animal_form')}
                  className="w-full justify-start text-left"
                >
                  <FaPlus className="mr-2" /> Cadastrar Animal
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeView === 'my_medicines' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('my_medicines')}
                  className="w-full justify-start text-left"
                >
                  <FaStethoscope className="mr-2" /> Meus Medicamentos
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeView === 'my_sales' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('my_sales')}
                  className="w-full justify-start text-left"
                >
                  <FaShoppingCart className="mr-2" /> Minhas Vendas
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeView === 'my_diets' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('my_diets')}
                  className="w-full justify-start text-left"
                >
                  <FaUtensils className="mr-2" /> Minhas Dietas
                </Button>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Informações Gerais</h2>
            <ul className="space-y-2">
              <li>
                <Button 
                  variant={activeView === 'all_animals' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('all_animals')}
                  className="w-full justify-start text-left"
                >
                  <FaClipboardList className="mr-2" /> Todos os Animais
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeView === 'all_farms' ? 'secondary' : 'ghost'} 
                  onClick={() => setActiveView('all_farms')}
                  className="w-full justify-start text-left"
                >
                  <FaHome className="mr-2" /> Todas as Fazendas
                </Button>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="mt-auto">
          <Button 
            onClick={logout} 
            variant="ghost" 
            className="w-full justify-start text-left text-red-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;