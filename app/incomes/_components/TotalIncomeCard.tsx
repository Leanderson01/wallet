import { Card, Stack, Group, Text } from "@mantine/core";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { cardStyles } from "@/app/lib/constants/themeStyles";

interface TotalIncomeCardProps {
  total: number;
}

export function TotalIncomeCard({ total }: TotalIncomeCardProps) {
  return (
    <Card padding="md" radius="md" style={cardStyles}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="sm" c="gray.5" fw={500}>
            Total de Entradas do Mês
          </Text>
          <Text size="xl" fw={700} c="#22C55E">
            {formatCurrency(total)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
