import { Card, Stack, Group, Text, Grid } from "@mantine/core";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { cardStyles, innerCardStyles } from "@/app/lib/constants/themeStyles";
import type { CategorySummary } from "@/app/lib/types/variableExpenses";

interface CategorySummaryCardProps {
  categorySummary: CategorySummary[];
  totalExpenses: number;
}

export function CategorySummaryCard({
  categorySummary,
  totalExpenses,
}: CategorySummaryCardProps) {
  if (categorySummary.length === 0) {
    return null;
  }

  return (
    <Card padding="md" radius="md" style={cardStyles}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} c="gray.0" size="lg">
            Resumo por Categoria
          </Text>
          <Text fw={700} c="gray.0" size="lg">
            Total: {formatCurrency(totalExpenses)}
          </Text>
        </Group>
        <Grid>
          {categorySummary.map(({ category, total }) => (
            <Grid.Col key={category} span={{ base: 12, sm: 6, md: 4 }}>
              <Card padding="sm" radius="md" style={innerCardStyles}>
                <Stack gap="xs">
                  <Text size="sm" c="gray.5" fw={500}>
                    {category}
                  </Text>
                  <Text size="xl" fw={700} c="#22C55E">
                    {formatCurrency(total)}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Card>
  );
}
