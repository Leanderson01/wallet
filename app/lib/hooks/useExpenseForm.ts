import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { ExpenseFormValues } from "../types/formTypes";
import { convertDateToTimestamp } from "../utils/dateHelpers";

interface UseExpenseFormProps {
  onCreateExpense: (data: {
    amount: number;
    category: string;
    description: string;
    date: number;
  }) => Promise<void>;
  onClose: () => void;
}

export function useExpenseForm({ onCreateExpense, onClose }: UseExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    initialValues: {
      amount: "",
      category: "",
      description: "",
      date: new Date(),
    },
    validate: {
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
      category: (value) =>
        value.length === 0 ? "Categoria é obrigatória" : null,
      description: (value) =>
        value.length < 2 ? "Descrição deve ter pelo menos 2 caracteres" : null,
      date: (value) => (value === null ? "Data é obrigatória" : null),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.date) {
        throw new Error("Data é obrigatória");
      }

      const amount = typeof values.amount === "number" ? values.amount : 0;
      if (amount <= 0) {
        throw new Error("Valor deve ser maior que zero");
      }

      const date = convertDateToTimestamp(values.date);

      await onCreateExpense({
        amount,
        category: values.category,
        description: values.description,
        date,
      });

      notifications.show({
        title: "Sucesso",
        message: "Gasto variável criado com sucesso",
        color: "green",
      });

      handleReset();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao criar gasto",
        color: "red",
      });
    }
  });

  const handleReset = () => {
    form.reset();
    form.setValues({
      amount: "",
      category: "",
      description: "",
      date: new Date(),
    });
  };

  return {
    form,
    handleSubmit,
    handleReset,
  };
}
