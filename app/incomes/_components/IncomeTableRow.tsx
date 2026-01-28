import { Text, Badge, ActionIcon, Table, Group } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatIncomeDateDisplay } from "@/app/lib/utils/incomeHelpers";
import { INCOME_TYPE } from "@/app/lib/constants/incomeTypes";
import type { Income, IncomeId } from "@/app/lib/types/incomes";

interface IncomeTableRowProps {
  income: Income;
  onEdit: (id: IncomeId) => void;
  onDelete: (id: IncomeId) => void;
}

export function IncomeTableRow({ income, onEdit, onDelete }: IncomeTableRowProps) {
  const meta = INCOME_TYPE[income.type];

  return (
    <Table.Tr>
      <Table.Td>
        <Badge color={meta.color} variant="light">
          {meta.label}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={500} c="gray.0">
          {formatCurrency(income.amount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text c="gray.4">{formatIncomeDateDisplay(income)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => onEdit(income._id)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete(income._id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
