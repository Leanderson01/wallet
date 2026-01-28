"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
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
import { PieChart, BarChart } from "@mantine/charts";

type CategoryChartDatum = {
  name: string;
  value: number;
  color: string;
};

type BarValueDatum = {
  name: string;
  value: number;
  type: string;
};

type MonthlyComparisonDatum = {
  name: string;
  "Mês Atual"?: number;
  "Mês Anterior"?: number;
};

type TooltipPayloadItem = {
  payload?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCategoryChartDatum = (value: unknown): value is CategoryChartDatum => {
  if (!isRecord(value)) return false;
  return typeof value.name === "string" && typeof value.value === "number";
};

const isBarValueDatum = (value: unknown): value is BarValueDatum => {
  if (!isRecord(value)) return false;
  return typeof value.name === "string" && typeof value.value === "number";
};

const isMonthlyComparisonDatum = (
  value: unknown
): value is MonthlyComparisonDatum => {
  if (!isRecord(value)) return false;
  return typeof value.name === "string";
};

const getTooltipDatum = <T,>(
  payload: TooltipPayloadItem[] | undefined,
  isDatum: (value: unknown) => value is T
): T | null => {
  if (!payload || payload.length === 0) return null;
  const value = payload[0]?.payload;
  if (!isDatum(value)) return null;
  return value;
};

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

  const expensesByCategory = useQuery(
    api.financialSummary.getExpensesByCategory,
    {
      month: currentMonth,
      year: currentYear,
    }
  );

  const monthlyComparison = useQuery(
    api.financialSummary.getMonthlyComparison,
    {
      month: currentMonth,
      year: currentYear,
    }
  );

  const getCategoryColor = (category: string) => {
    const colors = [
      "hsl(210, 70%, 50%)",
      "hsl(340, 70%, 50%)",
      "hsl(280, 70%, 50%)",
      "hsl(160, 70%, 50%)",
      "hsl(30, 70%, 50%)",
      "hsl(0, 70%, 50%)",
      "hsl(120, 70%, 50%)",
      "hsl(240, 70%, 50%)",
    ];
    const hash = category.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const categoryChartData = useMemo(
    () =>
      (expensesByCategory || []).map((item): CategoryChartDatum => ({
        name: item.category,
        value: item.total,
        color: getCategoryColor(item.category),
      })),
    [expensesByCategory]
  );

  if (
    financialSummary === undefined ||
    goals === undefined ||
    expensesByCategory === undefined ||
    monthlyComparison === undefined
  ) {
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
    remainingSpendingLimit,
    remainingDaysInMonth,
    dailySpendingLimit,
    savingsRate,
    fixedExpensesRatio,
    projectedSavings,
    totalIncomes,
    totalFixedExpenses,
    paidFixedExpenses,
    totalVariableExpenses,
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

  const fixedVsVariableData: BarValueDatum[] = [
    {
      name: "Receitas",
      value: totalIncomes,
      type: "Receitas",
    },
    {
      name: "Despesas Fixas",
      value: paidFixedExpenses,
      type: "Despesas Fixas",
    },
    {
      name: "Despesas Variáveis",
      value: totalVariableExpenses,
      type: "Despesas Variáveis",
    },
  ];

  const monthlyComparisonData: MonthlyComparisonDatum[] =
    monthlyComparison.hasPreviousMonth
    ? [
        {
          name: "Receitas",
          "Mês Atual": monthlyComparison.current.incomes,
          "Mês Anterior": monthlyComparison.previous.incomes,
        },
        {
          name: "Despesas Fixas",
          "Mês Atual": monthlyComparison.current.fixedExpenses,
          "Mês Anterior": monthlyComparison.previous.fixedExpenses,
        },
        {
          name: "Despesas Variáveis",
          "Mês Atual": monthlyComparison.current.variableExpenses,
          "Mês Anterior": monthlyComparison.previous.variableExpenses,
        },
        {
          name: "Economia",
          "Mês Atual": monthlyComparison.current.savings,
          "Mês Anterior": monthlyComparison.previous.savings,
        },
      ]
    : [
        {
          name: "Receitas",
          "Mês Atual": monthlyComparison.current.incomes,
        },
        {
          name: "Despesas Fixas",
          "Mês Atual": monthlyComparison.current.fixedExpenses,
        },
        {
          name: "Despesas Variáveis",
          "Mês Atual": monthlyComparison.current.variableExpenses,
        },
        {
          name: "Economia",
          "Mês Atual": monthlyComparison.current.savings,
        },
      ];

  const variableExpensesVariation = monthlyComparison.variations.variableExpenses;

  const renderCategoryTooltip = ({
    payload,
  }: {
    payload?: TooltipPayloadItem[];
  }) => {
    const data = getTooltipDatum(payload, isCategoryChartDatum);
    if (!data) return null;
    return (
      <Card padding="xs" style={{ backgroundColor: "#2d2e33" }}>
        <Text size="sm" c="gray.0" fw={500}>
          {data.name}
        </Text>
        <Text size="sm" c="gray.3">
          {formatCurrency(data.value)}
        </Text>
      </Card>
    );
  };

  const renderBarTooltip = ({
    payload,
  }: {
    payload?: TooltipPayloadItem[];
  }) => {
    const data = getTooltipDatum(payload, isBarValueDatum);
    if (!data) return null;
    return (
      <Card padding="xs" style={{ backgroundColor: "#2d2e33" }}>
        <Text size="sm" c="gray.0" fw={500}>
          {data.name}
        </Text>
        <Text size="sm" c="gray.3">
          {formatCurrency(data.value)}
        </Text>
      </Card>
    );
  };

  const renderMonthlyComparisonTooltip = ({
    payload,
  }: {
    payload?: TooltipPayloadItem[];
  }) => {
    const data = getTooltipDatum(payload, isMonthlyComparisonDatum);
    if (!data) return null;
    return (
      <Card padding="xs" style={{ backgroundColor: "#2d2e33" }}>
        <Text size="sm" c="gray.0" fw={500} mb="xs">
          {data.name}
        </Text>
        {data["Mês Atual"] !== undefined && (
          <Text size="sm" c="blue.4">
            Mês Atual: {formatCurrency(data["Mês Atual"])}
          </Text>
        )}
        {data["Mês Anterior"] !== undefined && (
          <Text size="sm" c="gray.4">
            Mês Anterior: {formatCurrency(data["Mês Anterior"])}
          </Text>
        )}
      </Card>
    );
  };

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
                Total de Despesas
              </Text>
              <Text
                size="xl"
                fw={700}
                c="#ef4444"
              >
                {formatCurrency(totalFixedExpenses + totalVariableExpenses)}
              </Text>
              <Text size="xs" c="gray.6">
                Fixas (todas) + Variáveis
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
                Quanto Posso Gastar Ainda
              </Text>
              <Text
                size="xl"
                fw={700}
                c={getValueColor(remainingSpendingLimit)}
              >
                {formatCurrency(remainingSpendingLimit)}
              </Text>
              {remainingDaysInMonth > 0 && dailySpendingLimit > 0 && (
                <Text size="xs" c="gray.6">
                  Limite diário: {formatCurrency(dailySpendingLimit)} (
                  {remainingDaysInMonth} dias restantes)
                </Text>
              )}
              {remainingDaysInMonth === 0 && (
                <Text size="xs" c="gray.6">
                  Fim do mês
                </Text>
              )}
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
                Variação Gastos Variáveis
              </Text>
              {monthlyComparison.hasPreviousMonth ? (
                <>
                  <Group align="flex-end" gap="xs">
                    <Text
                      size="xl"
                      fw={700}
                      c={
                        variableExpensesVariation.percentage >= 0
                          ? "#ef4444"
                          : "#22C55E"
                      }
                    >
                      {variableExpensesVariation.percentage >= 0 ? "+" : ""}
                      {variableExpensesVariation.percentage.toFixed(1)}%
                    </Text>
                  </Group>
                  <Text size="xs" c="gray.6">
                    {variableExpensesVariation.absolute >= 0 ? "+" : ""}
                    {formatCurrency(variableExpensesVariation.absolute)} vs. mês
                    anterior
                  </Text>
                </>
              ) : (
                <>
                  <Text size="xl" fw={700} c="gray.4">
                    --
                  </Text>
                  <Text size="xs" c="gray.6">
                    Sem dados do mês anterior
                  </Text>
                </>
              )}
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
                Taxa de Poupança
              </Text>
              <Group align="flex-end" gap="xs">
                <Text
                  size="xl"
                  fw={700}
                  c={savingsRate >= 20 ? "#22C55E" : savingsRate >= 10 ? "#eab308" : "#ef4444"}
                >
                  {savingsRate.toFixed(1)}%
                </Text>
                {savingsRate >= 20 && (
                  <Badge color="green" variant="light" size="sm">
                    Ótimo
                  </Badge>
                )}
                {savingsRate >= 10 && savingsRate < 20 && (
                  <Badge color="yellow" variant="light" size="sm">
                    Bom
                  </Badge>
                )}
                {savingsRate < 10 && (
                  <Badge color="red" variant="light" size="sm">
                    Atenção
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="gray.6">
                {savingsRate >= 20
                  ? "Meta de 20%+ atingida!"
                  : savingsRate >= 10
                  ? "Meta recomendada: 20%+"
                  : "Economize mais para melhorar"}
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
                Razão Despesas Fixas
              </Text>
              <Group align="flex-end" gap="xs">
                <Text
                  size="xl"
                  fw={700}
                  c={fixedExpensesRatio <= 50 ? "#22C55E" : fixedExpensesRatio <= 70 ? "#eab308" : "#ef4444"}
                >
                  {fixedExpensesRatio.toFixed(1)}%
                </Text>
                {fixedExpensesRatio <= 50 && (
                  <Badge color="green" variant="light" size="sm">
                    Ideal
                  </Badge>
                )}
                {fixedExpensesRatio > 50 && fixedExpensesRatio <= 70 && (
                  <Badge color="yellow" variant="light" size="sm">
                    Atenção
                  </Badge>
                )}
                {fixedExpensesRatio > 70 && (
                  <Badge color="red" variant="light" size="sm">
                    Crítico
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="gray.6">
                {fixedExpensesRatio <= 50
                  ? "Ideal: menos de 50% da renda"
                  : fixedExpensesRatio <= 70
                  ? "Considere reduzir despesas fixas"
                  : "Despesas fixas muito altas"}
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
                Projeção de Economia
              </Text>
              <Text
                size="xl"
                fw={700}
                c={getValueColor(projectedSavings)}
              >
                {formatCurrency(projectedSavings)}
              </Text>
              <Text size="xs" c="gray.6">
                Projeção no final do mês
              </Text>
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

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
            }}
          >
            <Stack gap="md">
              <Text size="lg" fw={600} c="gray.0">
                Gastos por Categoria
              </Text>
              {categoryChartData.length > 0 ? (
                <PieChart
                  data={categoryChartData}
                  withLabelsLine
                  labelsPosition="outside"
                  labelsType="percent"
                  withTooltip
                  tooltipProps={{
                    content: renderCategoryTooltip,
                  }}
                  size={200}
                />
              ) : (
                <Center h={200}>
                  <Text size="sm" c="gray.5">
                    Nenhum gasto registrado este mês
                  </Text>
                </Center>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
            }}
          >
            <Stack gap="md">
              <Text size="lg" fw={600} c="gray.0">
                Receitas vs. Despesas
              </Text>
              <BarChart
                h={300}
                data={fixedVsVariableData}
                dataKey="name"
                series={[{ name: "value", color: "blue.6", label: "Valor" }]}
                tickLine="y"
                withLegend
                legendProps={{ verticalAlign: "bottom" }}
                tooltipProps={{
                  content: renderBarTooltip,
                }}
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12 }}>
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: "#1a1b1e",
              border: "1px solid #373a40",
            }}
          >
            <Stack gap="md">
              <Text size="lg" fw={600} c="gray.0">
                Comparação Mensal
              </Text>
              {monthlyComparison.hasPreviousMonth ? (
                <BarChart
                  h={300}
                  data={monthlyComparisonData}
                  dataKey="name"
                  series={[
                    { name: "Mês Atual", color: "blue.6", label: "Mês Atual" },
                    { name: "Mês Anterior", color: "gray.6", label: "Mês Anterior" },
                  ]}
                  tickLine="y"
                  withLegend
                  legendProps={{ verticalAlign: "bottom" }}
                  tooltipProps={{
                  content: renderMonthlyComparisonTooltip,
                  }}
                />
              ) : (
                <Center h={300}>
                  <Text size="sm" c="gray.5">
                    Dados do mês anterior não disponíveis
                  </Text>
                </Center>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
