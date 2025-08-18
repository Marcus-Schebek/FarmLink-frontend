import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const MedicinesContext = createContext();

export const MedicinesProvider = ({ children }) => {
  const { authToken } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchMedicines() {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/medicines", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar medicamentos");
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MedicinesContext.Provider value={{ medicines, fetchMedicines, loading }}>
      {children}
    </MedicinesContext.Provider>
  );
};

export const useMedicines = () => useContext(MedicinesContext);
