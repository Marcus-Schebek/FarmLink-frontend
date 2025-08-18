import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAnimals } from "./AnimalsContext"; // já pega animais existentes

const HeatContext = createContext();

export const HeatProvider = ({ children }) => {
  const { animals } = useAnimals(); // lista de animais do usuário
  const [heats, setHeats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar cios no backend
  const fetchHeats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/heats"); // ajuste URL se precisar
      setHeats(res.data);
    } catch (err) {
      console.error("Erro ao buscar cios:", err);
    } finally {
      setLoading(false);
    }
  };

  // Criar um novo cio
  const createHeat = async (heatData) => {
    try {
      const res = await axios.post("http://localhost:3000/heats", {
        heat: heatData,
      });
      setHeats((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Erro ao criar cio:", err);
      throw err;
    }
  };

  // Atualizar cio
  const updateHeat = async (id, heatData) => {
    try {
      const res = await axios.put(`http://localhost:3000/heats/${id}`, {
        heat: heatData,
      });
      setHeats((prev) =>
        prev.map((h) => (h.id === id ? res.data : h))
      );
      return res.data;
    } catch (err) {
      console.error("Erro ao atualizar cio:", err);
      throw err;
    }
  };

  // Deletar cio
  const deleteHeat = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/heats/${id}`);
      setHeats((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Erro ao deletar cio:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchHeats();
  }, []);

  // Cios apenas dos animais do usuário logado (via AnimalsContext)
  const myHeats = heats.filter((h) =>
    animals.some((a) => a.id === h.id_animal)
  );

  return (
    <HeatContext.Provider
      value={{ heats, myHeats, loading, fetchHeats, createHeat, updateHeat, deleteHeat }}
    >
      {children}
    </HeatContext.Provider>
  );
};

export const useHeats = () => useContext(HeatContext);
