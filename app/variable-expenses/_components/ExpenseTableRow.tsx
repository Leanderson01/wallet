import { Text, Badge, ActionIcon, Table } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDate } from "@/app/lib/utils/formatDate";
import type { VariableExpense, VariableExpenseId } from "@/app/lib/types/variableExpenses";

interface ExpenseTableRowProps {
  expense: VariableExpense;
  onDelete: (id: VariableExpenseId) => void;
}

export function ExpenseTableRow({ expense, onDelete }: ExpenseTableRowProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <Text c="gray.4">{formatDate(expense.date)}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={500} c="gray.0">
          {expense.description}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">
          {expense.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text c="gray.0" fw={500}>
          {formatCurrency(expense.amount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(expense._id)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
