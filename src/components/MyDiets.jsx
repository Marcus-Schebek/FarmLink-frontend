import React, { useState, useMemo, useEffect } from "react"
import { useAnimals } from "../context/MyAnimalsContext"
import { useDiets } from "../context/MyDietsContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import MultiSelect from "@/components/MultiSelect"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DietForm = React.memo(({ 
  alimentType, setAlimentType,
  costKg, setCostKg,
  nutrients, setNutrients,
  selectedAnimals, setSelectedAnimals,
  animalOptions,
  dateBeginning, setDateBeginning,
  dateEnd, setDateEnd,
  dailyQuantity, setDailyQuantity,
  handleSubmit,
  isEditing,
  currentDietId
}) => {
  return (
    <form className={cn("grid gap-4")}>
      <div>
        <Label>Tipo de Alimento</Label>
        <Input 
          value={alimentType} 
          onChange={(e) => setAlimentType(e.target.value)} 
        />
      </div>

      <div>
        <Label>Custo por Kg</Label>
        <Input 
          type="number" 
          value={costKg} 
          onChange={(e) => setCostKg(e.target.value)} 
        />
      </div>

      <div>
        <Label>Nutrientes</Label>
        <Textarea 
          value={nutrients} 
          onChange={(e) => setNutrients(e.target.value)} 
        />
      </div>

      <div>
        <Label>Animais</Label>
        <MultiSelect
          options={animalOptions}
          selected={selectedAnimals}
          onChange={setSelectedAnimals}
          placeholder="Selecione animais"
          triggerLabel="Animais"
          maxBadges={3}
        />
      </div>

      <div className="flex gap-2">
        <div>
          <Label>Data Início</Label>
          <Input 
            type="date" 
            value={dateBeginning} 
            onChange={(e) => setDateBeginning(e.target.value)} 
          />
        </div>
        <div>
          <Label>Data Fim</Label>
          <Input 
            type="date" 
            value={dateEnd} 
            onChange={(e) => setDateEnd(e.target.value)} 
          />
        </div>
      </div>

      <div>
        <Label>Quantidade Diária (Kg)</Label>
        <Input 
          type="number" 
          value={dailyQuantity} 
          onChange={(e) => setDailyQuantity(e.target.value)} 
        />
      </div>

      <Button type="button" onClick={handleSubmit}>
        {isEditing ? "Atualizar Dieta" : "Salvar Dieta"}
      </Button>
    </form>
  )
})

export default function MyDiets() {
  const { animals } = useAnimals()
  const { myDiets, fetchMyDiets } = useDiets()
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDietId, setCurrentDietId] = useState(null)
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null)

  const [alimentType, setAlimentType] = useState("")
  const [costKg, setCostKg] = useState("")
  const [nutrients, setNutrients] = useState("")
  const [selectedAnimals, setSelectedAnimals] = useState([])
  const [dateBeginning, setDateBeginning] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [dailyQuantity, setDailyQuantity] = useState("")

  const animalOptions = useMemo(
    () => animals.map((a) => ({
      value: String(a.id),
      label: a.ear_tag
        ? `${a.ear_tag}${a.breed ? ` — ${a.breed}` : ""}`
        : `ID ${a.id}`,
    })),
    [animals]
  )

  const resetForm = useMemo(() => () => {
    setAlimentType("")
    setCostKg("")
    setNutrients("")
    setSelectedAnimals([])
    setDateBeginning("")
    setDateEnd("")
    setDailyQuantity("")
    setIsEditing(false)
    setCurrentDietId(null)
    setCurrentAssignmentId(null)
  }, [])

const handleSubmit = useMemo(() => async () => {
  if (!alimentType || !costKg || !nutrients || selectedAnimals.length === 0) {
    toast.error("Preencha todos os campos e selecione pelo menos um animal")
    return
  }

  try {
    const token = localStorage.getItem("authToken")

    if (isEditing && currentDietId) {
      // Atualizar dieta
      const dietResponse = await fetch(`http://localhost:3000/diets/${currentDietId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aliment_type: alimentType,
          cost_kg: parseFloat(costKg),
          nutrients,
        }),
      })

      if (!dietResponse.ok) throw new Error("Erro ao atualizar a dieta")

      // Buscar assignments atuais da dieta no backend
      const assignmentsRes = await fetch(`http://localhost:3000/animal_diets?diet_id=${currentDietId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const currentAssignments = await assignmentsRes.json()
      const currentAnimalIds = currentAssignments.map(a => String(a.id_animal))

      // Criar assignments para animais novos
      await Promise.all(
        selectedAnimals
          .filter(animalId => !currentAnimalIds.includes(animalId))
          .map(animalId =>
            fetch("http://localhost:3000/animal_diets", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id_animal: animalId,
                id_diet: currentDietId,
                date_beginning: dateBeginning,
                date_end: dateEnd,
                daily_quantity: parseFloat(dailyQuantity),
              }),
            })
          )
      )

      // Atualizar assignments já existentes
      await Promise.all(
        currentAssignments
          .filter(a => selectedAnimals.includes(String(a.id_animal)))
          .map(a =>
            fetch(`http://localhost:3000/animal_diets/${a.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id_animal: a.id_animal,
                id_diet: currentDietId,
                date_beginning: dateBeginning,
                date_end: dateEnd,
                daily_quantity: parseFloat(dailyQuantity),
              }),
            })
          )
      )

      // Remover assignments de animais desmarcados
      await Promise.all(
        currentAssignments
          .filter(a => !selectedAnimals.includes(String(a.id_animal)))
          .map(a =>
            fetch(`http://localhost:3000/animal_diets/${a.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            })
          )
      )

      toast.success("Dieta atualizada com sucesso!")
    } else {
      // Criar nova dieta
      const dietResponse = await fetch("http://localhost:3000/diets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aliment_type: alimentType,
          cost_kg: parseFloat(costKg),
          nutrients,
        }),
      })

      if (!dietResponse.ok) throw new Error("Erro ao criar a dieta")
      const diet = await dietResponse.json()

      // Criar vínculos com todos os animais selecionados
      await Promise.all(
        selectedAnimals.map((animalId) =>
          fetch("http://localhost:3000/animal_diets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_animal: animalId,
              id_diet: diet.id,
              date_beginning: dateBeginning,
              date_end: dateEnd,
              daily_quantity: parseFloat(dailyQuantity),
            }),
          })
        )
      )

      toast.success("Dieta criada com sucesso!")
    }

    setOpen(false)
    resetForm()
    fetchMyDiets() // força atualizar tabela
  } catch (err) {
    console.error(err)
    toast.error(`Erro ao ${isEditing ? "atualizar" : "criar"} a dieta`)
  }
}, [
  alimentType, costKg, nutrients, selectedAnimals, 
  dateBeginning, dateEnd, dailyQuantity, 
  isEditing, currentDietId, resetForm, fetchMyDiets
])


const handleEditDiet = async (diet) => {
  try {
    const token = localStorage.getItem("authToken")

    // Buscar todos os vínculos animal_diets dessa dieta
    const assignmentsRes = await fetch(`http://localhost:3000/animal_diets?diet_id=${diet.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const assignments = await assignmentsRes.json()

    // Atualizar estados do form
    setCurrentDietId(diet.id)
    setAlimentType(diet.aliment_type)
    setCostKg(diet.cost_kg)
    setNutrients(diet.nutrients)

    // Aqui pega todos os animais já vinculados e preenche no MultiSelect
    setSelectedAnimals(assignments.map(a => String(a.id_animal)))

    // Se quiser popular os outros campos do assignment, pegue do primeiro só como base
    if (assignments.length > 0) {
      setDateBeginning(assignments[0].date_beginning)
      setDateEnd(assignments[0].date_end)
      setDailyQuantity(assignments[0].daily_quantity)
    }

    setIsEditing(true)
    setOpen(true)
  } catch (err) {
    console.error("Erro ao carregar dieta para edição:", err)
    toast.error("Erro ao carregar dieta para edição")
  }
}

  const handleDeleteDiet = useMemo(() => async (dietId) => {
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`http://localhost:3000/diets/${dietId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erro ao deletar dieta")

      toast.success("Dieta deletada com sucesso!")
      fetchMyDiets() // Atualiza a lista após deletar
    } catch (err) {
      console.error(err)
      toast.error("Erro ao deletar dieta")
    }
  }, [fetchMyDiets])

  const memoizedForm = useMemo(() => (
    <DietForm
      alimentType={alimentType}
      setAlimentType={setAlimentType}
      costKg={costKg}
      setCostKg={setCostKg}
      nutrients={nutrients}
      setNutrients={setNutrients}
      selectedAnimals={selectedAnimals}
      setSelectedAnimals={setSelectedAnimals}
      animalOptions={animalOptions}
      dateBeginning={dateBeginning}
      setDateBeginning={setDateBeginning}
      dateEnd={dateEnd}
      setDateEnd={setDateEnd}
      dailyQuantity={dailyQuantity}
      setDailyQuantity={setDailyQuantity}
      handleSubmit={handleSubmit}
      isEditing={isEditing}
      currentDietId={currentDietId}
    />
  ), [
    alimentType, costKg, nutrients, selectedAnimals, animalOptions,
    dateBeginning, dateEnd, dailyQuantity, handleSubmit, isEditing, currentDietId
  ])

  return (
    <div className="p-4">
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        setOpen(isOpen)
      }}>
        <DialogTrigger asChild>
          <Button onClick={() => resetForm()}>Cadastrar Nova Dieta</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/90">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Dieta" : "Nova Dieta"}</DialogTitle>
          </DialogHeader>
          {memoizedForm}
        </DialogContent>
      </Dialog>

      {/* tabela de dietas */}
      <table className="w-full border-collapse border mt-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Alimento</th>
            <th className="border p-2">Custo/kg</th>
            <th className="border p-2">Nutrientes</th>
            <th className="border p-2">Animais</th>
            <th className="border p-2">Início</th>
            <th className="border p-2">Fim</th>
            <th className="border p-2">Qtde diária</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {myDiets.map((diet) =>
            diet.animals.map((a) => {
              const assignment = (diet.assignments || []).find((ad) => ad.id_animal === a.id) || {}
              return (
                <tr key={`${diet.id}-${a.id}`}>
                  <td className="border p-2">{diet.aliment_type}</td>
                  <td className="border p-2">{diet.cost_kg}</td>
                  <td className="border p-2">{diet.nutrients}</td>
                  <td className="border p-2">{a.ear_tag}</td>
                  <td className="border p-2">{assignment.date_beginning || "—"}</td>
                  <td className="border p-2">{assignment.date_end || "—"}</td>
                  <td className="border p-2">{assignment.daily_quantity || "—"}</td>
                  <td className="border p-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDiet(diet, assignment)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDiet(diet.id)}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}