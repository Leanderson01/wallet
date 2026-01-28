import { Card, Stack, Text } from "@mantine/core";
import { IconWallet } from "@tabler/icons-react";
import { cardStyles } from "@/app/lib/constants/themeStyles";

export function EmptyIncomesCard() {
  return (
    <Card padding="xl" radius="md" style={cardStyles}>
      <Stack align="center" gap="md">
        <IconWallet size={48} color="#22C55E" />
        <Text c="gray.5" size="sm" ta="center">
          Você ainda não tem entradas cadastradas para este mês.
          <br />
          Crie uma nova entrada para começar!
        </Text>
      </Stack>
    </Card>
  );
}
