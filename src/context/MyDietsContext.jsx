import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useAnimals } from "./MyAnimalsContext";
import { toast } from "sonner";

const DietContext = createContext(null);

export function DietProvider({ children }) {
  const { user } = useAuth();
  const { animals } = useAnimals();

  const [myDiets, setMyDiets] = useState([]); // Dietas com animais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authToken = useMemo(() => localStorage.getItem("authToken"), []);
  const myAnimalIds = useMemo(() => animals.map((a) => a.id), [animals]);
  const animalsById = useMemo(() => {
    const map = new Map();
    animals.forEach((a) => map.set(a.id, a));
    return map;
  }, [animals]);

  // Fetch das dietas dos meus animais
  async function fetchMyDiets() {
    if (!user) return;
    if (!authToken) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    setLoading(true);
    setError(null);
    try {

      // 1) Pegar todos os vínculos animal-dieta
      const resAD = await fetch("http://localhost:3000/animal_diets", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!resAD.ok) throw new Error("Falha ao buscar animal_diets");
      const animalDiets = await resAD.json();
      // 2) Filtrar somente meus animais
      const myAnimalDiets = animalDiets.filter((ad) =>
        myAnimalIds.includes(ad.id_animal)
      );


      if (myAnimalDiets.length === 0) {
        setMyDiets([]);
        setLoading(false);
        return;
      }
      // 3) Extrair ids de dietas
      const dietIds = [...new Set(myAnimalDiets.map((ad) => ad.id_diet))];
      // 4) Buscar todas dietas
      const resDiets = await fetch("http://localhost:3000/diets", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!resDiets.ok) throw new Error("Falha ao buscar diets");
      const allDiets = await resDiets.json();
      const dietsById = new Map();
      allDiets.forEach((d) => dietsById.set(d.id, d));

      // 5) Agrupar dietas com animais
      const group = new Map(); // dietId -> { diet, animals: [], assignments: [] }
      for (const ad of myAnimalDiets) {
        const dId = ad.id_diet;
        const aId = ad.id_animal;
        const diet = dietsById.get(dId);
        const animal = animalsById.get(aId);
        if (!diet || !animal) continue;

        if (!group.has(dId)) {
          group.set(dId, { diet, animals: [], assignments: [] });
        }
        const bucket = group.get(dId);
        bucket.assignments.push(ad);
        if (!bucket.animals.some((x) => x.id === aId)) {
          bucket.animals.push({ id: aId, ear_tag: animal.ear_tag, breed: animal.breed });
        }
      }

      // 6) Normalizar para tabela
      const normalized = Array.from(group.values()).map(({ diet, animals, assignments }) => ({
        id: diet.id,
        aliment_type: diet.aliment_type ?? "—",
        cost_kg: diet.cost_kg ?? null,
        nutrients: diet.nutrients ?? "",
        animals, // [{id, ear_tag}]
        assignments_count: assignments.length,
        assignments,
      }));

      setMyDiets(normalized);
    } catch (err) {
      console.error("[DietContext] Erro fetchMyDiets:", err);
      setError(err.message || "Erro ao carregar dietas");
      toast.error("Erro ao carregar dietas", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Criar dieta + vincular animais
  async function createDietAndAssign({ aliment_type, cost_kg, nutrients, animal_ids = [] }) {
    if (!authToken) throw new Error("Token ausente");
    try {
      const res = await fetch("http://localhost:3000/diets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ diet: { aliment_type, cost_kg, nutrients } }),
      });
      if (!res.ok) throw new Error("Falha ao criar dieta");
      const newDiet = await res.json();


      // Vincular animais
      for (const aId of animal_ids) {
        try {
          const resAD = await fetch("http://localhost:3000/animal_diets", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ animal_diet: { id_diet: newDiet.id, id_animal: aId } }),
          });

        } catch (e) {
          console.error("[DietContext] erro vincular animal_diet:", e);
        }
      }

      await fetchMyDiets();
      toast.success("Dieta cadastrada com sucesso!");
      return newDiet;
    } catch (err) {
      console.error("[DietContext] createDietAndAssign erro:", err);
      toast.error("Erro ao cadastrar dieta", { description: err.message });
      throw err;
    }
  }

  // Atualiza sempre que meus animais mudarem
  useEffect(() => {
    if (user && animals.length >= 0) fetchMyDiets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, animals]);

  return (
    <DietContext.Provider value={{ myDiets, loading, error, fetchMyDiets, createDietAndAssign }}>
      {children}
    </DietContext.Provider>
  );
}

export function useDiets() {
  return useContext(DietContext);
}
