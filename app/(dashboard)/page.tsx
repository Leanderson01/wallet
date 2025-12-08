"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Title,
  Text,
  Card,
  Grid,
  Group,
  Stack,
  Progress,
  Badge,
  Loader,
  Center,
  Divider,
} from "@mantine/core";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getMonthName(month: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return months[month - 1] || "";
}

export default function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const financialSummary = useQuery(
    api.financialSummary.getFinancialSummary,
    {
      month: currentMonth,
      year: currentYear,
    }
  );

  const goals = useQuery(api.goals.getGoals, {
    month: currentMonth,
    year: currentYear,
  });

  if (financialSummary === undefined || goals === undefined) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const {
    availableBalance,
    savings,
    nextPaymentDate,
    nextPaymentAmount,
  } = financialSummary;

  const hasGoals = goals && goals.length > 0;

  const totalSavedAmount = goals
    ? goals.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0)
    : 0;
  const totalMonthlyGoal = goals
    ? goals.reduce((sum, goal) => sum + goal.monthlyGoal, 0)
    : 0;
  const goalsProgress =
    totalMonthlyGoal > 0 ? (totalSavedAmount / totalMonthlyGoal) * 100 : 0;

  const isPositive = (value: number) => value >= 0;
  const getValueColor = (value: number) =>
    isPositive(value) ? "#22C55E" : "#ef4444";

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} mb="xs" c="gray.0">
          Dashboard
        </Title>
        <Text c="gray.5" size="sm">
          {getMonthName(currentMonth)} {currentYear}
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
            }}
          >
            <Stack gap="xs">
              <Text size="sm" c="gray.5" fw={500}>
                Saldo Disponível
              </Text>
              <Text
                size="xl"
                fw={700}
                c={getValueColor(availableBalance)}
              >
                {formatCurrency(availableBalance)}
              </Text>
              <Text size="xs" c="gray.6">
                Disponível para gastos variáveis
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
            }}
          >
            <Stack gap="xs">
              <Text size="sm" c="gray.5" fw={500}>
                Economia do Mês
              </Text>
              <Text
                size="xl"
                fw={700}
                c={getValueColor(savings)}
              >
                {formatCurrency(savings)}
              </Text>
              <Text size="xs" c="gray.6">
                Economia acumulada este mês
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
              opacity: hasGoals ? 1 : 0.5,
              filter: hasGoals ? "none" : "blur(1px)",
              pointerEvents: hasGoals ? "auto" : "none",
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="sm" c="gray.5" fw={500}>
                    Meta Mensal
                  </Text>
                  {hasGoals ? (
                    <Text size="xl" fw={700} c="gray.0" mt="xs">
                      {formatCurrency(totalMonthlyGoal)}
                    </Text>
                  ) : (
                    <Text size="xl" fw={700} c="gray.4" mt="xs">
                      R$ 0,00
                    </Text>
                  )}
                </div>
                {hasGoals && (
                  <Badge
                    color={goalsProgress >= 100 ? "green" : "blue"}
                    variant="light"
                  >
                    {goalsProgress > 100
                      ? "100%+"
                      : `${goalsProgress.toFixed(0)}%`}
                  </Badge>
                )}
              </Group>
              {hasGoals ? (
                <>
                  <Progress
                    value={Math.min(100, goalsProgress)}
                    color={goalsProgress >= 100 ? "green" : "blue"}
                    size="md"
                    radius="xl"
                    mt="sm"
                  />
                  <Text size="xs" c="gray.6">
                    {formatCurrency(totalSavedAmount)} de{" "}
                    {formatCurrency(totalMonthlyGoal)}
                  </Text>
                  {goalsProgress > 100 && (
                    <Text size="xs" c="#22C55E" ta="center" mt="xs">
                      Meta ultrapassada em{" "}
                      {formatCurrency(totalSavedAmount - totalMonthlyGoal)}!
                    </Text>
                  )}
                </>
              ) : (
                <Text size="xs" c="gray.5" ta="center" mt="sm">
                  Crie metas na página de Metas para acompanhar seu progresso
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {nextPaymentDate && nextPaymentAmount && (
        <Card
          padding="lg"
          radius="md"
          style={{
            backgroundColor: "#1a1b1e",
            border: "1px solid #373a40",
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" c="gray.5" fw={500} mb="xs">
                  Próximo Recebimento
                </Text>
                <Text size="lg" fw={600} c="gray.0">
                  Dia {nextPaymentDate}
                </Text>
              </div>
              <Text size="xl" fw={700} c="#22C55E">
                {formatCurrency(nextPaymentAmount)}
              </Text>
            </Group>
            <Divider color="#373a40" />
            <Text size="xs" c="gray.6">
              Próximo recebimento programado para o dia {nextPaymentDate} deste
              mês
            </Text>
          </Stack>
        </Card>
      )}

      {!nextPaymentDate && (
        <Card
          padding="lg"
          radius="md"
          style={{
            backgroundColor: "#1a1b1e",
            border: "1px solid #373a40",
          }}
        >
          <Text size="sm" c="gray.5" ta="center">
            Configure seus recebimentos mensais na página de Configurações
          </Text>
        </Card>
      )}
    </Stack>
  );
}
