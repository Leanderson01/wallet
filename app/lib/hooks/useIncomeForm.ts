import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { Income, IncomeFormValues, IncomeId } from "../types/incomes";
import { toPaymentDateFromDay } from "../utils/dateHelpers";

interface UseIncomeFormProps {
  onCreateIncome: (data: {
    type: "fixed" | "oneTime";
    amount: number;
    paymentDate: number;
    dayOfMonth?: number;
  }) => Promise<void>;
  onUpdateIncome: (data: {
    _id: IncomeId;
    type: "fixed" | "oneTime";
    amount: number;
    paymentDate: number;
    dayOfMonth?: number;
  }) => Promise<void>;
  onClose: () => void;
  editingIncome: Income | null;
}

export function useIncomeForm({
  onCreateIncome,
  onUpdateIncome,
  onClose,
  editingIncome,
}: UseIncomeFormProps) {
  const form = useForm<IncomeFormValues>({
    initialValues: {
      type: "fixed",
      amount: "",
      dayOfMonth: "",
      paymentDate: null,
    },
    validate: {
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
      dayOfMonth: (value, values) => {
        if (values.type === "fixed") {
          if (value === "" || value === null) return "Dia é obrigatório";
          if (typeof value === "number" && (value < 1 || value > 31))
            return "Dia deve estar entre 1 e 31";
        }
        return null;
      },
      paymentDate: (value, values) => {
        if (values.type === "oneTime") {
          if (value === null) return "Data é obrigatória";
        }
        return null;
      },
    },
  });

  const handleReset = () => {
    form.reset();
    form.setFieldValue("type", "fixed");
  };

  const loadForEdit = (income: Income) => {
    form.setValues({
      type: income.type,
      amount: income.amount,
      dayOfMonth: income.dayOfMonth ?? "",
      paymentDate:
        income.type === "oneTime" ? new Date(income.paymentDate) : null,
    });
  };

  const handleSubmit = form.onSubmit(async (values: IncomeFormValues) => {
    try {
      const amount =
        typeof values.amount === "number" && values.amount > 0
          ? values.amount
          : null;
      if (!amount) {
        notifications.show({
          title: "Erro",
          message: "Valor é obrigatório e deve ser maior que zero",
          color: "red",
        });
        return;
      }

      const type = values.type;
      let paymentDate: number;
      let dayOfMonth: number | undefined;

      if (type === "fixed") {
        const dayValue =
          typeof values.dayOfMonth === "number" ? values.dayOfMonth : null;
        if (!dayValue || dayValue < 1 || dayValue > 31) {
          notifications.show({
            title: "Erro",
            message: "Dia do mês é obrigatório para entradas fixas (1-31)",
            color: "red",
          });
          return;
        }
        dayOfMonth = dayValue;
        paymentDate = toPaymentDateFromDay(dayValue);
      } else {
        const dateValue = values.paymentDate;
        if (!dateValue) {
          notifications.show({
            title: "Erro",
            message: "Data é obrigatória para entradas avulsas",
            color: "red",
          });
          return;
        }
        paymentDate = dateValue.getTime();
      }

      if (editingIncome) {
        await onUpdateIncome({
          _id: editingIncome._id,
          type,
          amount,
          paymentDate,
          dayOfMonth,
        });
        notifications.show({
          title: "Sucesso",
          message: "Entrada atualizada com sucesso",
          color: "green",
        });
      } else {
        await onCreateIncome({ type, amount, paymentDate, dayOfMonth });
        notifications.show({
          title: "Sucesso",
          message: "Entrada criada com sucesso",
          color: "green",
        });
      }

      handleReset();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao salvar entrada",
        color: "red",
      });
    }
  });

  return {
    form,
    handleSubmit,
    handleReset,
    loadForEdit,
  };
}
