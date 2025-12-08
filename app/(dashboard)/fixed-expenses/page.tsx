"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "@mantine/form";
import {
  Title,
  Text,
  Button,
  Table,
  Badge,
  Group,
  Stack,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Loader,
  Center,
  Card,
  SegmentedControl,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconCheck, IconPlus } from "@tabler/icons-react";
import "@mantine/dates/styles.css";

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
  return date.getDate().toString();
}

interface FormValues {
  name: string;
  amount: number | "";
  category: string;
  suggestedPaymentDate: Date | null;
}

export default function FixedExpensesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<Id<"fixedExpenses"> | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const expenses = useQuery(api.fixedExpenses.getFixedExpenses);
  const createExpense = useMutation(api.fixedExpenses.createFixedExpense);
  const updateExpense = useMutation(api.fixedExpenses.updateFixedExpense);
  const markAsPaid = useMutation(api.fixedExpenses.markFixedExpenseAsPaid);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      amount: "",
      category: "",
      suggestedPaymentDate: null,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Nome deve ter pelo menos 2 caracteres" : null,
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
      category: (value) =>
        value.length === 0 ? "Categoria é obrigatória" : null,
      suggestedPaymentDate: (value) =>
        value === null ? "Data sugerida é obrigatória" : null,
    },
  });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let filtered = expenses;

    if (statusFilter !== "all") {
      filtered = filtered.filter((expense) => expense.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    return filtered;
  }, [expenses, statusFilter, categoryFilter]);

  const handleOpenModal = (expenseId?: Id<"fixedExpenses">) => {
    if (expenseId) {
      const expense = expenses?.find((e) => e._id === expenseId);
      if (expense) {
        setEditingId(expenseId);
        form.setValues({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          suggestedPaymentDate: new Date(expense.suggestedPaymentDate),
        });
      }
    } else {
      setEditingId(null);
      form.reset();
    }
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingId(null);
    form.reset();
  };

  const handleSubmit = form.onSubmit(async (values: FormValues) => {
    try {
      let suggestedPaymentDate: number;
      
      if (values.suggestedPaymentDate) {
        if (values.suggestedPaymentDate instanceof Date) {
          suggestedPaymentDate = values.suggestedPaymentDate.getTime();
        } else if (typeof values.suggestedPaymentDate === "string") {
          suggestedPaymentDate = new Date(values.suggestedPaymentDate).getTime();
        } else if (typeof values.suggestedPaymentDate === "number") {
          suggestedPaymentDate = values.suggestedPaymentDate;
        } else {
          suggestedPaymentDate = new Date().getTime();
        }
      } else {
        suggestedPaymentDate = new Date().getTime();
      }

      if (editingId) {
        await updateExpense({
          _id: editingId,
          name: values.name,
          amount: typeof values.amount === "number" ? values.amount : 0,
          category: values.category,
          suggestedPaymentDate,
        });
        notifications.show({
          title: "Sucesso",
          message: "Despesa atualizada com sucesso",
          color: "green",
        });
      } else {
        await createExpense({
          name: values.name,
          amount: typeof values.amount === "number" ? values.amount : 0,
          category: values.category,
          suggestedPaymentDate,
        });
        notifications.show({
          title: "Sucesso",
          message: "Despesa criada com sucesso",
          color: "green",
        });
      }
      handleCloseModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao salvar despesa",
        color: "red",
      });
    }
  });

  const handleMarkAsPaid = async (expenseId: Id<"fixedExpenses">) => {
    try {
      await markAsPaid({ _id: expenseId });
      notifications.show({
        title: "Sucesso",
        message: "Despesa marcada como paga",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao marcar como paga",
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
            Despesas Fixas
          </Title>
          <Text c="gray.5" size="sm">
            Gerencie suas despesas fixas mensais
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
        >
          Nova Despesa
        </Button>
      </Group>

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
            <SegmentedControl
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value as "all" | "paid" | "unpaid")
              }
              data={[
                { label: "Todas", value: "all" },
                { label: "Pagas", value: "paid" },
                { label: "Não Pagas", value: "unpaid" },
              ]}
            />
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
              Nenhuma despesa encontrada
            </Text>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>Valor</Table.Th>
                    <Table.Th>Categoria</Table.Th>
                    <Table.Th>Data Sugerida</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Ações</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredExpenses.map((expense) => (
                    <Table.Tr key={expense._id}>
                      <Table.Td>
                        <Text fw={500} c="gray.0">
                          {expense.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c="gray.0">{formatCurrency(expense.amount)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c="gray.4">{expense.category}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c="gray.4">
                          Dia {formatDate(expense.suggestedPaymentDate)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={expense.status === "paid" ? "green" : "red"}
                          variant="light"
                        >
                          {expense.status === "paid" ? "Pago" : "Não Pago"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleOpenModal(expense._id)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          {expense.status === "unpaid" && (
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => handleMarkAsPaid(expense._id)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          )}
                        </Group>
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
        title={editingId ? "Editar Despesa" : "Nova Despesa"}
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
            <TextInput
              label="Nome"
              placeholder="Ex: Aluguel, Internet, etc."
              required
              key={form.key("name")}
              {...form.getInputProps("name")}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

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

            <DateInput
              label="Data Sugerida de Pagamento"
              placeholder="Selecione a data"
              required
              key={form.key("suggestedPaymentDate")}
              {...form.getInputProps("suggestedPaymentDate")}
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
              <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
