import { Card, Stack, Text, Table } from "@mantine/core";
import { ExpenseTableRow } from "./ExpenseTableRow";
import { ExpenseFilters } from "./ExpenseFilters";
import { cardStyles } from "@/app/lib/constants/themeStyles";
import type { VariableExpense, VariableExpenseId } from "@/app/lib/types/variableExpenses";

interface ExpenseTableProps {
  expenses: VariableExpense[];
  uniqueCategories: string[];
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
  onDelete: (id: VariableExpenseId) => void;
}

export function ExpenseTable({
  expenses,
  uniqueCategories,
  categoryFilter,
  onCategoryFilterChange,
  onDelete,
}: ExpenseTableProps) {
  return (
    <Card padding="md" radius="md" style={cardStyles}>
      <Stack gap="md">
        <ExpenseFilters
          uniqueCategories={uniqueCategories}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
        />

        {expenses.length === 0 ? (
          <Text c="gray.5" ta="center" py="xl">
            Nenhum gasto encontrado
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data</Table.Th>
                  <Table.Th>Descrição</Table.Th>
                  <Table.Th>Categoria</Table.Th>
                  <Table.Th>Valor</Table.Th>
                  <Table.Th>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {expenses.map((expense) => (
                  <ExpenseTableRow
                    key={expense._id}
                    expense={expense}
                    onDelete={onDelete}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>
    </Card>
  );
}
