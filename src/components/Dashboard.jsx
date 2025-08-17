import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardContent from './DashboardContent';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('my_animals_list');
  // Adiciona o novo estado para controlar a expansão da sidebar
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Passa o estado e a função de atualização para a sidebar */}
      <DashboardSidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* A largura da main-content pode precisar de ajuste dependendo do seu CSS */}
      <div className="flex-1 transition-all duration-300">
        <DashboardContent activeView={activeView} />
      </div>
    </div>
  );
};

export default Dashboard;