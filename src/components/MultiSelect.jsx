import React from "react";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function MultiSelect({
  options,                 // [{ value: "1", label: "ABC" }, ...]
  selected = [],           // ["1","2",...]
  onChange,                // (newValues: string[]) => void
  placeholder = "Selecionar...",
  emptyText = "Nenhuma opção encontrada.",
  triggerLabel,            // texto do botão, ex: "Animais"
  maxBadges = 2,           // quantos chips mostrar no botão antes de resumir com “+N”
  className = "",
}) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value) => {
    const exists = selected.includes(value);
    const next = exists ? selected.filter((v) => v !== value) : [...selected, value];
    onChange(next);
  };

  const clearAll = (e) => {
    e?.stopPropagation?.();
    onChange([]);
  };

  const selectAll = () => {
    onChange(options.map((o) => String(o.value)));
  };

  const selectedOptions = options.filter((o) => selected.includes(String(o.value)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="shrink-0">{triggerLabel || "Selecionar"}</span>
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                {selectedOptions.slice(0, maxBadges).map((o) => (
                  <Badge key={o.value} variant="secondary" className="max-w-[120px] truncate">
                    {o.label}
                  </Badge>
                ))}
                {selectedOptions.length > maxBadges && (
                  <Badge variant="secondary">+{selectedOptions.length - maxBadges}</Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedOptions.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearAll}
                className="h-6 w-6"
                title="Limpar seleção"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <div className="flex items-center justify-between px-2 py-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>Selecionar todos</Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>Limpar</Button>
            </div>
            <CommandGroup>
              {options.map((opt) => {
                const value = String(opt.value);
                const isSelected = selected.includes(value);
                return (
                  <CommandItem
                    key={value}
                    value={opt.label}
                    onSelect={() => toggle(value)}
                    className="cursor-pointer"
                  >
                    <div className="mr-2">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggle(value)} />
                    </div>
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 opacity-60" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
