import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  FaSignOutAlt,
  FaPlus,
  FaShoppingCart,
  FaUtensils,
  FaClipboardList,
  FaCalendarAlt,
  FaHome,
} from 'react-icons/fa';
import { PiCowDuotone } from "react-icons/pi";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardSidebar = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      label: 'Meus Animais',
      icon: <PiCowDuotone size={20} />,
      view: 'my_animals_list',
    },
    {
      label: 'Cadastrar Animal',
      icon: <FaPlus size={20} />,
      view: 'register_animal_form',
    },
    {
      label: 'Planejamento Sanitário',
      icon: <FaCalendarAlt size={20} />,
      view: 'my_medicines',
    },
    {
      label: 'Minhas Vendas',
      icon: <FaShoppingCart size={20} />,
      view: 'my_sales',
    },
    {
      label: 'Minhas Dietas',
      icon: <FaUtensils size={20} />,
      view: 'my_diets',
    },
  ];
  
  const generalItems = [
    {
      label: 'Todos os Animais',
      icon: <FaClipboardList size={20} />,
      view: 'all_animals',
    },
    {
      label: 'Todas as Fazendas',
      icon: <FaHome size={20} />,
      view: 'all_farms',
    },
  ];

  const renderSidebarItem = (item) => {
    return isCollapsed ? (
      <TooltipProvider key={item.view}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeView === item.view ? 'secondary' : 'ghost'}
              className="w-full h-9 justify-center"
              onClick={() => setActiveView(item.view)}
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <Button
        key={item.view}
        variant={activeView === item.view ? 'secondary' : 'ghost'}
        className="w-full h-9 justify-start"
        onClick={() => setActiveView(item.view)}
      >
        {item.icon}
        <span className="ml-2">{item.label}</span>
      </Button>
    );
  };

  return (
    <aside
      className={`relative border-r bg-background flex flex-col justify-between p-2 pt-6 pb-4
        ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}
    >
      <div className="absolute top-4 -right-3 z-10">
        <Button
          variant="secondary"
          className="rounded-full w-6 h-6 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <div className={`mb-6 font-bold text-lg text-green-500 ${isCollapsed ? '' : 'text-center'}`}>
          {isCollapsed ? 'FL' : 'FarmLink'}
        </div>
        
        <nav className={`flex flex-col gap-2 ${isCollapsed ? 'w-full' : ''}`}>
          {navigationItems.map(renderSidebarItem)}
        </nav>

        <Separator className="my-4 w-full" />
        
        <nav className={`flex flex-col gap-2 ${isCollapsed ? 'w-full' : ''}`}>
          {generalItems.map(renderSidebarItem)}
        </nav>
      </div>

      {/* Mensagem de Boas-Vindas */}
      {user && !isCollapsed && (
        <div className="w-full text-start p-2 ml-5 mt-auto">
          <span className="text-sm text-gray-600 dark:text-gray-400">Bem-vindo(a)</span>
          <p className="font-bold text-lg leading-tight truncate">{user.name}</p>
        </div>
      )}
      
      {/* Botão de Logout */}
      <div className={`${isCollapsed ? 'w-full' : ''} ${!isCollapsed && user ? 'mt-4' : ''}`}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-9 justify-center"
                  onClick={logout}
                >
                  <FaSignOutAlt size={20} className="text-red-500" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-9 justify-start text-red-500"
            onClick={logout}
          >
            <FaSignOutAlt size={20} className="mr-2" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;