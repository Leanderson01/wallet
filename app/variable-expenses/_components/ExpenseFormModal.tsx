"use client";

import { Modal, Stack, NumberInput, Select, TextInput, Group, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useExpenseForm } from "@/app/lib/hooks/useExpenseForm";
import { CATEGORIES } from "@/app/lib/constants/categories";
import { modalStyles, inputStyles } from "@/app/lib/constants/themeStyles";

interface ExpenseFormModalProps {
  opened: boolean;
  onClose: () => void;
  onCreateExpense: (data: {
    amount: number;
    category: string;
    description: string;
    date: number;
  }) => Promise<void>;
}

export function ExpenseFormModal({
  opened,
  onClose,
  onCreateExpense,
}: ExpenseFormModalProps) {
  const { form, handleSubmit, handleReset } = useExpenseForm({
    onCreateExpense,
    onClose,
  });

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Novo Gasto Variável"
      size="md"
      styles={modalStyles}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput
            label="Valor"
            placeholder="0.00"
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            {...form.getInputProps("amount")}
            styles={inputStyles}
          />

          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            required
            data={CATEGORIES}
            {...form.getInputProps("category")}
            styles={inputStyles}
          />

          <TextInput
            label="Descrição"
            placeholder="Ex: Almoço no restaurante, Uber, etc."
            required
            {...form.getInputProps("description")}
            styles={inputStyles}
          />

          <DateInput
            label="Data"
            placeholder="Selecione a data"
            required
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("date")}
            styles={inputStyles}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" radius="sm">
              Criar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
