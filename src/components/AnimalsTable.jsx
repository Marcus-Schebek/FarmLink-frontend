import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext"; // supondo que você tenha um contexto de auth

export function AnimalsTable({ animals, owners, onDeleteAnimal, showOwners = false, isAllAnimals = false }) {
  const { user, authToken } = useAuth(); 
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [totalValue, setTotalValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleOpenDrawer = (animal) => {
    setSelectedAnimal(animal);
    setOpenDrawer(true);
  };

const handleBuyAnimal = async () => {
  console.log("O botão é chamado")
  if (!user || !selectedAnimal) return console.log("Usuário ou animal não selecionado", user, selectedAnimal);
  const token = localStorage.getItem("authToken")
  try {
    // 1) Criar a venda
    const saleRes = await fetch("http://localhost:3000/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
          sale_date: new Date().toISOString(),
          total_value: parseFloat(totalValue),
          payment_method: paymentMethod,
          id_seller: selectedAnimal.id_owner,
          id_buyer: user.id,
      }),
    });

    if (!saleRes.ok) throw new Error("Erro ao criar venda");
    const sale = await saleRes.json();

    // 2) Relacionar animal à venda
    const saRes = await fetch("http://localhost:3000/sale_animals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
          id_sale: sale.id,
          id_animal: selectedAnimal.id,
      }),
    });

    if (!saRes.ok) throw new Error("Erro ao vincular animal à venda");

    // 3) Atualizar dono do animal (agora com Authorization!)
    const updateRes = await fetch(`http://localhost:3000/animals/${selectedAnimal.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({
          ...selectedAnimal,
          id_owner: user.id,
      }),
    });

    if (!updateRes.ok) throw new Error("Erro ao atualizar dono do animal");

    alert("Compra realizada com sucesso!");
    setOpenDrawer(false);
    setSelectedAnimal(null);
    setTotalValue("");
    setPaymentMethod("");
  } catch (error) {
    console.error("Erro na compra:", error);
    alert("Erro ao realizar compra.");
  }
};


  return (
    <div className="mt-8 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brinco</TableHead>
            <TableHead>Raça</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Produção</TableHead>
            {showOwners && (
              <>
                <TableHead>Dono</TableHead>
                <TableHead>Contato</TableHead>
              </>
            )}
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.ear_tag}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>{new Date(animal.birth_date).toLocaleDateString()}</TableCell>
              <TableCell>{animal.sex === "M" ? "Macho" : "Fêmea"}</TableCell>
              <TableCell>{animal.current_weight} kg</TableCell>
              <TableCell>{animal.status}</TableCell>
              <TableCell>{animal.production_objective}</TableCell>
              {showOwners && (
                <>
                  <TableCell>{owners[animal.id_owner]?.name || "—"}</TableCell>
                  <TableCell>{owners[animal.id_owner]?.phone || "—"}</TableCell>
                </>
              )}
              <TableCell className="text-right">
                {isAllAnimals ? (
                  <Button variant="default" size="sm" onClick={() => handleOpenDrawer(animal)}>
                    Comprar Animal
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteAnimal(animal.id)}
                  >
                    Remover Animal
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Drawer de compra */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Negociar Compra</DrawerTitle>
          </DrawerHeader>
          {selectedAnimal && (
            <div className="p-4 space-y-4">
              <p>
                Você está comprando o animal <b>{selectedAnimal.ear_tag}</b> ({selectedAnimal.breed})
              </p>
              <div>
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>
              <div>
                <Label>Método de Pagamento</Label>
                <Input
                  placeholder="Ex: PIX, Boleto..."
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button onClick={handleBuyAnimal}>Confirmar Compra</Button>
            <Button variant="outline" onClick={() => setOpenDrawer(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
