import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useIncomes } from "./useIncomes";
import { useIncomeForm } from "./useIncomeForm";
import type { IncomeId } from "../types/incomes";

export function useIncomesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<IncomeId | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<IncomeId | null>(null);

  const {
    incomes,
    isLoading,
    createIncome,
    updateIncome,
    deleteIncome,
    currentMonth,
    currentYear,
  } = useIncomes();

  const editingIncome =
    incomes && editingId
      ? incomes.find((i) => i._id === editingId) ?? null
      : null;

  const totalIncome = incomes
    ? incomes.reduce((sum, income) => sum + income.amount, 0)
    : 0;

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingId(null);
  };

  const handleCreateIncome = async (data: {
    type: "fixed" | "oneTime";
    amount: number;
    paymentDate: number;
    dayOfMonth?: number;
  }) => {
    await createIncome({
      ...data,
      month: currentMonth,
      year: currentYear,
    });
  };

  const handleUpdateIncome = async (data: {
    _id: IncomeId;
    type: "fixed" | "oneTime";
    amount: number;
    paymentDate: number;
    dayOfMonth?: number;
  }) => {
    await updateIncome(data);
  };

  const handleDeleteRequest = (incomeId: IncomeId) => {
    setIncomeToDelete(incomeId);
    setDeleteModalOpened(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpened(false);
    setIncomeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!incomeToDelete) return;
    try {
      await deleteIncome({ _id: incomeToDelete });
      notifications.show({
        title: "Sucesso",
        message: "Entrada excluída com sucesso",
        color: "green",
      });
      handleCloseDeleteModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao excluir entrada",
        color: "red",
      });
    }
  };

  const { form, handleSubmit, handleReset, loadForEdit } = useIncomeForm({
    onCreateIncome: handleCreateIncome,
    onUpdateIncome: handleUpdateIncome,
    onClose: handleCloseModal,
    editingIncome,
  });

  const handleOpenModal = (incomeId?: IncomeId) => {
    if (incomeId && incomes) {
      const income = incomes.find((i) => i._id === incomeId);
      if (income) {
        setEditingId(incomeId);
        loadForEdit(income);
      }
    } else {
      setEditingId(null);
      handleReset();
    }
    setModalOpened(true);
  };

  return {
    incomes,
    isLoading,
    totalIncome,
    modalOpened,
    editingIncome,
    handleOpenModal,
    handleCloseModal,
    handleDeleteRequest,
    deleteModalOpened,
    handleCloseDeleteModal,
    handleConfirmDelete,
    form,
    handleSubmit,
    handleReset,
  };
}
