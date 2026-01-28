"use client";

import { useState } from "react";
import { Title, Text, Button, Group, Stack, Loader, Center } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useVariableExpenses } from "@/app/lib/hooks/useVariableExpenses";
import { useExpenseFilters } from "@/app/lib/hooks/useExpenseFilters";
import { ExpenseFormModal } from "./_components/ExpenseFormModal";
import { ExpenseTable } from "./_components/ExpenseTable";
import { CategorySummaryCard } from "./_components/CategorySummaryCard";
import type { VariableExpenseId } from "@/app/lib/types/variableExpenses";

export default function VariableExpensesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const { expenses, isLoading, createExpense, deleteExpense } = useVariableExpenses();
  const {
    filteredExpenses,
    categorySummary,
    totalExpenses,
    uniqueCategories,
    categoryFilter,
    setCategoryFilter,
  } = useExpenseFilters(expenses);

  const handleCreateExpense = async (data: {
    amount: number;
    category: string;
    description: string;
    date: number;
  }) => {
    await createExpense(data);
  };

  const handleDeleteExpense = async (expenseId: VariableExpenseId) => {
    try {
      await deleteExpense({ _id: expenseId });
      notifications.show({
        title: "Sucesso",
        message: "Gasto deletado com sucesso",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erro",
        message: error instanceof Error ? error.message : "Erro ao deletar gasto",
        color: "red",
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="xs" c="gray.0">
            Gastos Variáveis
          </Title>
          <Text c="gray.5" size="sm">
            Gerencie seus gastos variáveis do mês
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="outline"
          radius="sm"
          onClick={() => setModalOpened(true)}
        >
          Novo Gasto
        </Button>
      </Group>

      <CategorySummaryCard
        categorySummary={categorySummary}
        totalExpenses={totalExpenses}
      />

      <ExpenseTable
        expenses={filteredExpenses}
        uniqueCategories={uniqueCategories}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onDelete={handleDeleteExpense}
      />

      <ExpenseFormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onCreateExpense={handleCreateExpense}
      />
    </Stack>
  );
}
