import React from 'react';
import RegisterAnimalForm from './RegisterAnimalForm'; 
import AllAnimalsTable from './AllAnimalsTable';
import MyAnimalsTable from './MyAnimalsTable';
import MySalesTable from './MySalesTable';
import MyDiets from './MyDiets';

// --- COMPONENTES DE PLACEHOLDER ---
const MyMedicines = () => <div className="p-8">Seção de Meus Medicamentos</div>;
const AllFarms = () => <div className="p-8">Tabela de Todas as Fazendas</div>;

const DashboardContent = ({ activeView }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'my_animals_list':
        return <MyAnimalsTable />;
      case 'register_animal_form':
        return <RegisterAnimalForm />; 
      case 'my_medicines':
        return <MyMedicines />;
      case 'my_sales':
        return <MySalesTable />;
      case 'my_diets':
        return <MyDiets />;
      case 'all_animals':
        return <AllAnimalsTable />;
      case 'all_farms':
        return <AllFarms />;
      default:
        return <MyAnimalsTable />;
    }
  };

  return (
    <main className="flex-1 p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      {renderContent()}
    </main>
  );
};

export default DashboardContent;