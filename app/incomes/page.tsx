"use client";

import { Title, Text, Button, Group, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useIncomesPage } from "@/app/lib/hooks/useIncomesPage";
import { TotalIncomeCard } from "./_components/TotalIncomeCard";
import { EmptyIncomesCard } from "./_components/EmptyIncomesCard";
import { IncomeTable } from "./_components/IncomeTable";
import { IncomeFormModal } from "./_components/IncomeFormModal";
import { DeleteConfirmModal } from "./_components/DeleteConfirmModal";
import Loading from "../_components/loading";

export default function IncomesPage() {
  const {
    incomes,
    isLoading,
    totalIncome,
    modalOpened,
    editingIncome,
    form,
    handleSubmit,
    handleReset,
    handleOpenModal,
    handleCloseModal,
    handleDeleteRequest,
    deleteModalOpened,
    handleCloseDeleteModal,
    handleConfirmDelete,
  } = useIncomesPage();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="xs" c="gray.0">
            Entradas
          </Title>
          <Text c="gray.5" size="sm">
            Gerencie suas entradas mensais
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
          variant="outline"
          radius="sm"
        >
          Nova Entrada
        </Button>
      </Group>

      <TotalIncomeCard total={totalIncome} />

      {incomes && incomes.length === 0 ? (
        <EmptyIncomesCard />
      ) : incomes ? (
        <IncomeTable
          incomes={incomes}
          onEdit={(id) => handleOpenModal(id)}
          onDelete={handleDeleteRequest}
        />
      ) : null}

      <IncomeFormModal
        opened={modalOpened}
        onClose={handleCloseModal}
        editingIncome={editingIncome}
        form={form}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  );
}
