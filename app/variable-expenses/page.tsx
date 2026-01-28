"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "@mantine/form";
import {
  Title,
  Text,
  Button,
  Table,
  Group,
  Stack,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Loader,
  Center,
  Card,
  Grid,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import "@mantine/dates/styles.css";
import { Id } from "@/convex/_generated/dataModel";

const CATEGORIES = [
  "Transporte",
  "Moradia",
  "Alimentação",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface FormValues {
  amount: number | "";
  category: string;
  description: string;
  date: Date | null | string;
}

export default function VariableExpensesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const expenses = useQuery(api.variableExpenses.getVariableExpenses, {
    month: currentMonth,
    year: currentYear,
  });
  const createExpense = useMutation(api.variableExpenses.createVariableExpense);
  const deleteVariableExpense = useMutation(api.variableExpenses.deleteVariableExpense);
  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      amount: "",
      category: "",
      description: "",
      date: new Date(),
    },
    validate: {
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
      category: (value: string) =>
        value.length === 0 ? "Categoria é obrigatória" : null,
      description: (value: string) =>
        value.length < 2 ? "Descrição deve ter pelo menos 2 caracteres" : null,
      date: (value: Date | null | string) =>
        value === null ? "Data é obrigatória" : null,
    },
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    if (categoryFilter) {
      return expenses.filter((expense) => expense.category === categoryFilter);
    }

    return expenses;
  }, [expenses, categoryFilter]);

  const categorySummary = useMemo(() => {
    if (!expenses) return [];

    const summary = expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(summary)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const handleOpenModal = () => {
    form.reset();
    form.setValues({
      amount: "",
      category: "",
      description: "",
      date: new Date(),
    });
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    form.reset();
  };

  const handleSubmit = form.onSubmit(async (values: FormValues) => {
    try {
      const getDateTimestamp = (dateValue: Date | null | string | undefined): number => {
        if (!dateValue) {
          return new Date().getTime();
        }
        
        if (dateValue instanceof Date) {
          return dateValue.getTime();
        }
        
        if (typeof dateValue === "string") {
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getTime();
          }
        }
        
        return new Date().getTime();
      };

      const date = getDateTimestamp(values.date);

      await createExpense({
        amount: typeof values.amount === "number" ? values.amount : 0,
        category: values.category,
        description: values.description,
        date,
      });

      notifications.show({
        title: "Sucesso",
        message: "Gasto variável criado com sucesso",
        color: "green",
      });

      handleCloseModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao criar gasto",
        color: "red",
      });
    }
  });

  const handleDeleteExpense = async (expenseId: Id<"variableExpenses">) => {
    try {
      await deleteVariableExpense({ _id: expenseId });
      notifications.show({
        title: "Sucesso",
        message: "Gasto deletado com sucesso",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao deletar gasto",
        color: "red",
      });
    }
  };

  if (expenses === undefined) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const uniqueCategories = Array.from(
    new Set(expenses.map((e) => e.category))
  ).sort();

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="xs" c="gray.0">
            Gastos Variáveis
          </Title>
          <Text c="gray.5" size="sm">
            Gerencie seus gastos variáveis do mês
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="outline"
          radius="sm"
          onClick={handleOpenModal}
        >
          Novo Gasto
        </Button>
      </Group>

      {categorySummary.length > 0 && (
        <Card
          padding="md"
          radius="md"
          style={{
            backgroundColor: "#1a1b1e",
            border: "1px solid #373a40",
          }}
        >
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
                  <Card
                    padding="sm"
                    radius="md"
                    style={{
                      backgroundColor: "#141517",
                      border: "1px solid #373a40",
                    }}
                  >
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
      )}

      <Card
        padding="md"
        radius="md"
        style={{
          backgroundColor: "#1a1b1e",
          border: "1px solid #373a40",
        }}
      >
        <Stack gap="md">
          <Group>
            <Select
              placeholder="Filtrar por categoria"
              clearable
              value={categoryFilter}
              onChange={setCategoryFilter}
              data={uniqueCategories}
              style={{ flex: 1, maxWidth: 300 }}
            />
          </Group>

          {filteredExpenses.length === 0 ? (
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
                  {filteredExpenses.map((expense) => (
                    <Table.Tr key={expense._id}>
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
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteExpense(expense._id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title="Novo Gasto Variável"
        size="md"
        styles={{
          content: {
            backgroundColor: "#1a1b1e",
          },
          header: {
            backgroundColor: "#1a1b1e",
            borderBottom: "1px solid #373a40",
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <NumberInput
              label="Valor"
              placeholder="0.00"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              key={form.key("amount")}
              {...form.getInputProps("amount")}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

            <Select
              label="Categoria"
              placeholder="Selecione uma categoria"
              required
              data={CATEGORIES}
              key={form.key("category")}
              {...form.getInputProps("category")}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

            <TextInput
              label="Descrição"
              placeholder="Ex: Almoço no restaurante, Uber, etc."
              required
              key={form.key("description")}
              {...form.getInputProps("description")}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

            <DateInput
              label="Data"
              placeholder="Selecione a data"
              required
              valueFormat="DD/MM/YYYY"
              key={form.key("date")}
              {...form.getInputProps("date")}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" radius="sm">Criar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
