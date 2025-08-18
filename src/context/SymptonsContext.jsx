import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAnimals } from "./AnimalsContext";

const SymptomsContext = createContext();

export function SymptomsProvider({ children }) {
  const { authToken } = useAuth();
  const { myAnimals } = useAnimals();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSymptoms();
  }, [authToken, myAnimals]);

  const fetchSymptoms = async () => {
    if (!authToken || myAnimals.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/symptoms", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      const filtered = data.filter(sym =>
        myAnimals.some(animal => animal.id === sym.id_animal)
      );
      setSymptoms(filtered);
    } catch (err) {
      console.error("Erro ao buscar sintomas:", err);
    } finally {
      setLoading(false);
    }
  };

  const createSymptom = async (symptomData) => {
    try {
      const res = await fetch("http://localhost:3000/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ symptom: symptomData }),
      });
      const newSym = await res.json();
      setSymptoms(prev => [...prev, newSym]);
    } catch (err) {
      console.error("Erro ao criar sintoma:", err);
    }
  };

  const updateSymptom = async (id, updates) => {
    try {
      const res = await fetch(`http://localhost:3000/symptoms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ symptom: updates }),
      });
      const updated = await res.json();
      setSymptoms(prev =>
        prev.map(sym => (sym.id === id ? updated : sym))
      );
    } catch (err) {
      console.error("Erro ao atualizar sintoma:", err);
    }
  };

  const deleteSymptom = async (id) => {
    try {
      await fetch(`http://localhost:3000/symptoms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSymptoms(prev => prev.filter(sym => sym.id !== id));
    } catch (err) {
      console.error("Erro ao deletar sintoma:", err);
    }
  };

  return (
    <SymptomsContext.Provider
      value={{ symptoms, loading, createSymptom, updateSymptom, deleteSymptom }}
    >
      {children}
    </SymptomsContext.Provider>
  );
}

export const useSymptoms = () => useContext(SymptomsContext);
