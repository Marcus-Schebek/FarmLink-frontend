import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const AnimalsContext = createContext();

export function MyAnimalsProvider({ children }) {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchMyAnimals() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const animalsResponse = await fetch("http://localhost:3000/animals", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!animalsResponse.ok) throw new Error("Falha ao buscar animais.");
      const allAnimalsData = await animalsResponse.json();

      const myAnimalsData = allAnimalsData.filter(
        (animal) => animal.id_owner === user.id
      );
      setAnimals(myAnimalsData);

      // Busca donos
      const ownerIds = [...new Set(myAnimalsData.map((a) => a.id_owner))];
      const ownerDataArray = await Promise.all(
        ownerIds.map((id) =>
          fetch(`http://localhost:3000/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json())
        )
      );
      const ownersMap = ownerDataArray.reduce((acc, owner) => {
        acc[owner.id] = owner;
        return acc;
      }, {});
      setOwners(ownersMap);
    } catch (err) {
      console.error("Erro na busca:", err.message);
      setError("Falha ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnimal(animalId) {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este animal? Esta ação é irreversível."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const response = await fetch(
        `http://localhost:3000/animals/${animalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir o animal.");
      }

      setAnimals((prev) => prev.filter((a) => a.id !== animalId));
      toast.success("Animal excluído", {
        description: `O animal com ID ${animalId} foi excluído com sucesso.`,
      });
    } catch (err) {
      console.error("Erro na exclusão:", err.message);
      toast.error("Erro na Exclusão", {
        description:
          err.message || "Ocorreu um erro inesperado ao excluir o animal.",
      });
    }
  }

  // Fetch inicial
  useEffect(() => {
    if (user) {
      fetchMyAnimals();
    }
  }, [user]);

  return (
    <AnimalsContext.Provider
      value={{ animals, owners, loading, error, fetchMyAnimals, deleteAnimal }}
    >
      {children}
    </AnimalsContext.Provider>
  );
}

export function useAnimals() {
  return useContext(AnimalsContext);
}
