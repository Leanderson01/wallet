"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm } from "@mantine/form";
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  NumberInput,
  Loader,
  Center,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Switch,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconEdit, IconTrash, IconWallet } from "@tabler/icons-react";
import "@mantine/dates/styles.css";

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
  type: "fixed" | "oneTime";
  amount: number | "";
  dayOfMonth: number | "";
  paymentDate: Date | null;
}

export default function IncomesPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<Id<"incomes"> | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const incomes = useQuery(api.incomes.getIncomes, {
    month: currentMonth,
    year: currentYear,
  });

  const createIncome = useMutation(api.incomes.createIncome);
  const updateIncome = useMutation(api.incomes.updateIncome);
  const deleteIncome = useMutation(api.incomes.deleteIncome);

  const form = useForm<FormValues>({
    initialValues: {
      type: "fixed",
      amount: "",
      dayOfMonth: "",
      paymentDate: null,
    },
    validate: {
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
      dayOfMonth: (value, values) => {
        if (values.type === "fixed") {
          if (value === "" || value === null) return "Dia é obrigatório";
          if (typeof value === "number" && (value < 1 || value > 31))
            return "Dia deve estar entre 1 e 31";
        }
        return null;
      },
      paymentDate: (value, values) => {
        if (values.type === "oneTime") {
          if (value === null) return "Data é obrigatória";
        }
        return null;
      },
    },
  });

  const handleOpenModal = (incomeId?: Id<"incomes">) => {
    if (incomeId && incomes) {
      const income = incomes.find((i) => i._id === incomeId);
      if (income) {
        setEditingId(incomeId);
        form.setValues({
          type: income.type,
          amount: income.amount,
          dayOfMonth: income.dayOfMonth ?? "",
          paymentDate:
            income.type === "oneTime"
              ? new Date(income.paymentDate)
              : null,
        });
      }
    } else {
      setEditingId(null);
      form.reset();
      form.setFieldValue("type", "fixed");
    }
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingId(null);
    form.reset();
    form.setFieldValue("type", "fixed");
  };

  const handleSubmit = form.onSubmit(async (values: FormValues) => {
    try {
      const currentValues = form.getValues();
      const amount = typeof currentValues.amount === "number" && currentValues.amount > 0
        ? currentValues.amount
        : typeof values.amount === "number" && values.amount > 0
        ? values.amount
        : null;

      if (!amount || amount <= 0) {
        notifications.show({
          title: "Erro",
          message: "Valor é obrigatório e deve ser maior que zero",
          color: "red",
        });
        return;
      }

      let paymentDate: number;
      let dayOfMonth: number | undefined;

      const type = currentValues.type || values.type;

      if (type === "fixed") {
        const dayValue = typeof currentValues.dayOfMonth === "number"
          ? currentValues.dayOfMonth
          : typeof values.dayOfMonth === "number"
          ? values.dayOfMonth
          : null;

        if (!dayValue || dayValue < 1 || dayValue > 31) {
          throw new Error("Dia do mês é obrigatório para entradas fixas (1-31)");
        }
        dayOfMonth = dayValue;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const day = Math.min(dayValue, daysInMonth);
        paymentDate = new Date(year, month, day).getTime();
      } else {
        const dateValue = currentValues.paymentDate || values.paymentDate;
        if (!dateValue) {
          throw new Error("Data é obrigatória para entradas avulsas");
        }
        paymentDate = dateValue.getTime();
        dayOfMonth = undefined;
      }

      if (editingId) {
        await updateIncome({
          _id: editingId,
          type,
          amount,
          paymentDate,
          dayOfMonth,
        });

        notifications.show({
          title: "Sucesso",
          message: "Entrada atualizada com sucesso",
          color: "green",
        });
      } else {
        await createIncome({
          type,
          amount,
          paymentDate,
          dayOfMonth,
          month: currentMonth,
          year: currentYear,
        });

        notifications.show({
          title: "Sucesso",
          message: "Entrada criada com sucesso",
          color: "green",
        });
      }

      handleCloseModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao salvar entrada",
        color: "red",
      });
    }
  });

  const handleDelete = async (incomeId: Id<"incomes">) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) {
      return;
    }

    try {
      await deleteIncome({ _id: incomeId });
      notifications.show({
        title: "Sucesso",
        message: "Entrada excluída com sucesso",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao excluir entrada",
        color: "red",
      });
    }
  };

  if (incomes === undefined) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="xs" c="gray.0">
            Entradas
          </Title>
          <Text c="gray.5" size="sm">
            Gerencie suas entradas mensais
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
          variant="outline"
          radius="sm"
        >
          Nova Entrada
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
          <Group justify="space-between" align="center">
            <Text size="sm" c="gray.5" fw={500}>
              Total de Entradas do Mês
            </Text>
            <Text size="xl" fw={700} c="#22C55E">
              {formatCurrency(totalIncome)}
            </Text>
          </Group>
        </Stack>
      </Card>

      {incomes.length === 0 ? (
        <Card
          padding="xl"
          radius="md"
          style={{
            backgroundColor: "#1a1b1e",
            border: "1px solid #373a40",
          }}
        >
          <Stack align="center" gap="md">
            <IconWallet size={48} color="#22C55E" />
            <Text c="gray.5" size="sm" ta="center">
              Você ainda não tem entradas cadastradas para este mês.
              <br />
              Crie uma nova entrada para começar!
            </Text>
          </Stack>
        </Card>
      ) : (
        <Card
          padding="md"
          radius="md"
          style={{
            backgroundColor: "#1a1b1e",
            border: "1px solid #373a40",
          }}
        >
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
                  <Table.Tr key={income._id}>
                    <Table.Td>
                      <Badge
                        color={income.type === "fixed" ? "blue" : "green"}
                        variant="light"
                      >
                        {income.type === "fixed" ? "Fixa" : "Avulsa"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} c="gray.0">
                        {formatCurrency(income.amount)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="gray.4">
                        {income.type === "fixed"
                          ? `Dia ${income.dayOfMonth || new Date(income.paymentDate).getDate()}`
                          : formatDate(income.paymentDate)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleOpenModal(income._id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(income._id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingId ? "Editar Entrada" : "Nova Entrada"}
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
            <Switch
              mt="md"
              label={form.values.type === "fixed" ? "Entrada Fixa" : "Entrada Avulsa"}
              description={
                form.values.type === "fixed"
                  ? "Valor que entra todo mês no mesmo dia"
                  : "Valor extra que caiu no mês"
              }
              checked={form.values.type === "fixed"}
              onChange={(event) => {
                form.setFieldValue(
                  "type",
                  event.currentTarget.checked ? "fixed" : "oneTime"
                );
                if (event.currentTarget.checked) {
                  form.setFieldValue("paymentDate", null);
                } else {
                  form.setFieldValue("dayOfMonth", "");
                }
              }}
              styles={{
                label: { color: "#ced4da" },
                description: { color: "#868e96" },
              }}
            />

            {form.values.type === "fixed" ? (
              <NumberInput
                label="Dia do Mês"
                placeholder="Ex: 5, 15, 30"
                required
                min={1}
                max={31}
                {...form.getInputProps("dayOfMonth")}
                styles={{
                  label: { color: "#ced4da" },
                  input: {
                    backgroundColor: "#141517",
                    borderColor: "#373a40",
                    color: "#ced4da",
                  },
                }}
              />
            ) : (
              <DateInput
                label="Data do Recebimento"
                placeholder="Selecione a data"
                required
                {...form.getInputProps("paymentDate")}
                styles={{
                  label: { color: "#ced4da" },
                  input: {
                    backgroundColor: "#141517",
                    borderColor: "#373a40",
                    color: "#ced4da",
                  },
                }}
              />
            )}

            <NumberInput
              label="Valor"
              placeholder="0.00"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              {...form.getInputProps("amount")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const formElement = e.currentTarget.closest("form");
                  if (formElement) {
                    setTimeout(() => {
                      formElement.requestSubmit();
                    }, 0);
                  }
                }
              }}
              styles={{
                label: { color: "#ced4da" },
                input: {
                  backgroundColor: "#141517",
                  borderColor: "#373a40",
                  color: "#ced4da",
                },
              }}
            />

            <Text size="xs" c="gray.6">
              {form.values.type === "fixed"
                ? "Esta entrada será registrada automaticamente todo mês no dia especificado."
                : "Esta entrada é única e não se repetirá automaticamente."}
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" radius="sm">{editingId ? "Atualizar" : "Criar"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
