import { Card, Table } from "@mantine/core";
import { IncomeTableRow } from "./IncomeTableRow";
import { cardStyles } from "@/app/lib/constants/themeStyles";
import type { Income, IncomeId } from "@/app/lib/types/incomes";

interface IncomeTableProps {
  incomes: Income[];
  onEdit: (id: IncomeId) => void;
  onDelete: (id: IncomeId) => void;
}

export function IncomeTable({
  incomes,
  onEdit,
  onDelete,
}: IncomeTableProps) {
  return (
    <Card padding="md" radius="md" style={cardStyles}>
      <Table.ScrollContainer minWidth={800}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Valor</Table.Th>
              <Table.Th>Data/Dia</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {incomes.map((income) => (
              <IncomeTableRow
                key={income._id}
                income={income}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
