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
  Progress,
  Badge,
  Button,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
  Loader,
  Center,
  Grid,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTarget, IconPlus, IconTrash, IconWallet } from "@tabler/icons-react";

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

interface FormValues {
  name: string;
  description: string;
  monthlyGoal: number | "";
}

interface SaveFormValues {
  amount: number | "";
}

export default function GoalsPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<Id<"goals"> | null>(null);
  const [savingGoalId, setSavingGoalId] = useState<Id<"goals"> | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const goals = useQuery(api.goals.getGoals, {
    month: currentMonth,
    year: currentYear,
  });

  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);
  const addToGoal = useMutation(api.goals.addToGoal);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      monthlyGoal: "",
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Nome deve ter pelo menos 2 caracteres" : null,
      monthlyGoal: (value) => {
        if (value === "" || value === null) return "Meta é obrigatória";
        if (typeof value === "number" && value <= 0)
          return "Meta deve ser maior que zero";
        return null;
      },
    },
  });

  const saveForm = useForm<SaveFormValues>({
    mode: "uncontrolled",
    initialValues: {
      amount: "",
    },
    validate: {
      amount: (value) => {
        if (value === "" || value === null) return "Valor é obrigatório";
        if (typeof value === "number" && value <= 0)
          return "Valor deve ser maior que zero";
        return null;
      },
    },
  });

  const handleOpenModal = (goalId?: Id<"goals">) => {
    if (goalId && goals) {
      const goal = goals.find((g) => g._id === goalId);
      if (goal) {
        setEditingId(goalId);
        form.setValues({
          name: goal.name,
          description: goal.description || "",
          monthlyGoal: goal.monthlyGoal,
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
      if (editingId) {
        await updateGoal({
          _id: editingId,
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          monthlyGoal:
            typeof values.monthlyGoal === "number" ? values.monthlyGoal : 0,
        });

        notifications.show({
          title: "Sucesso",
          message: "Meta atualizada com sucesso",
          color: "green",
        });
      } else {
        await createGoal({
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          monthlyGoal:
            typeof values.monthlyGoal === "number" ? values.monthlyGoal : 0,
          month: currentMonth,
          year: currentYear,
        });

        notifications.show({
          title: "Sucesso",
          message: "Meta criada com sucesso",
          color: "green",
        });
      }

      handleCloseModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao salvar meta",
        color: "red",
      });
    }
  });

  const handleOpenSaveModal = (goalId: Id<"goals">) => {
    setSavingGoalId(goalId);
    saveForm.reset();
    setSaveModalOpened(true);
  };

  const handleCloseSaveModal = () => {
    setSaveModalOpened(false);
    setSavingGoalId(null);
    saveForm.reset();
  };

  const handleSave = saveForm.onSubmit(async (values: SaveFormValues) => {
    if (!savingGoalId) return;

    try {
      const amount =
        typeof values.amount === "number" ? values.amount : 0;

      await addToGoal({
        _id: savingGoalId,
        amount,
      });

      notifications.show({
        title: "Sucesso",
        message: `${formatCurrency(amount)} guardado na meta`,
        color: "green",
      });

      handleCloseSaveModal();
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao guardar na meta",
        color: "red",
      });
    }
  });

  const handleDelete = async (goalId: Id<"goals">) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) {
      return;
    }

    try {
      await deleteGoal({ _id: goalId });
      notifications.show({
        title: "Sucesso",
        message: "Meta excluída com sucesso",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erro",
        message:
          error instanceof Error ? error.message : "Erro ao excluir meta",
        color: "red",
      });
    }
  };

  if (goals === undefined) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="xs" c="gray.0">
            Metas
          </Title>
          <Text c="gray.5" size="sm">
            {getMonthName(currentMonth)} {currentYear}
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
          variant="outline"
          radius="sm"
        >
          Nova Meta
        </Button>
      </Group>

      <Grid>
        {goals.length === 0 ? (
          <Grid.Col span={12}>
            <Card
              padding="xl"
              radius="md"
              style={{
                backgroundColor: "#1a1b1e",
                border: "1px solid #373a40",
              }}
            >
              <Stack align="center" gap="md">
                <IconTarget size={48} color="#22C55E" />
                <Text c="gray.5" size="sm" ta="center">
                  Você ainda não tem metas cadastradas para este mês.
                  <br />
                  Crie uma nova meta para começar a acompanhar seu progresso!
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ) : (
          goals.map((goal) => {
            const savedAmount = goal.savedAmount || 0;
            const progressPercentage = (savedAmount / goal.monthlyGoal) * 100;
            const isGoalAchieved = progressPercentage >= 100;
            const remaining = Math.max(0, goal.monthlyGoal - savedAmount);
            const displayProgress = Math.min(100, progressPercentage);

            const getSpan = () => {
              if (goals.length === 1) {
                return { base: 12 };
              }
              if (goals.length === 2) {
                return { base: 12, sm: 6 };
              }
              return { base: 12, sm: 6, md: 4 };
            };

            return (
              <Grid.Col key={goal._id} span={getSpan()}>
                <Card
                  padding="lg"
                  radius="md"
                  style={{
                    backgroundColor: "#1a1b1e",
                    border: "1px solid #373a40",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack gap="md" style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Group gap="xs" align="center">
                          <IconTarget size={20} color="#22C55E" />
                          <Text size="md" fw={600} c="gray.0" lineClamp={1}>
                            {goal.name}
                          </Text>
                        </Group>
                        {goal.description && (
                          <Text size="xs" c="gray.5" lineClamp={2}>
                            {goal.description}
                          </Text>
                        )}
                        <Text size="xl" fw={700} c="gray.0">
                          {formatCurrency(goal.monthlyGoal)}
                        </Text>
                      </Stack>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          leftSection={<IconWallet size={14} />}
                          onClick={() => handleOpenSaveModal(goal._id)}
                        >
                          Guardar
                        </Button>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleOpenModal(goal._id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(goal._id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    <div>
                      <Group justify="space-between" align="center" mb="xs">
                        <Text size="xs" c="gray.5">
                          Progresso
                        </Text>
                        <Badge
                          color={isGoalAchieved ? "green" : "blue"}
                          variant="light"
                          size="sm"
                        >
                          {progressPercentage > 100
                            ? "100%+"
                            : `${progressPercentage.toFixed(1)}%`}
                        </Badge>
                      </Group>
                      <Progress
                        value={displayProgress}
                        color={isGoalAchieved ? "green" : "blue"}
                        size="md"
                        radius="xl"
                        animated={progressPercentage > 0}
                      />
                      {progressPercentage > 100 && (
                        <Text size="xs" c="gray.5" mt="xs" ta="center">
                          Meta ultrapassada em{" "}
                          {formatCurrency(savedAmount - goal.monthlyGoal)}!
                        </Text>
                      )}
                    </div>

                    <Group grow>
                      <div>
                        <Text size="xs" c="gray.5" mb={4}>
                          Guardado
                        </Text>
                        <Text size="sm" fw={600} c="#22C55E">
                          {formatCurrency(savedAmount)}
                        </Text>
                      </div>
                      <div style={{ textAlign: "end" }}>
                        <Text size="xs" c="gray.5" mb={4}>
                          Restante
                        </Text>
                        <Text size="sm" fw={600} c="gray.0">
                          {formatCurrency(remaining)}
                        </Text>
                      </div>
                    </Group>

                    {isGoalAchieved && (
                      <Text size="xs" c="#22C55E" fw={500} ta="center">
                        🎉 Meta atingida!
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })
        )}
      </Grid>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingId ? "Editar Meta" : "Nova Meta"}
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
              label="Nome da Meta"
              placeholder="Ex: Economia para viagem"
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

            <Textarea
              label="Descrição"
              placeholder="Descrição opcional da meta"
              autosize
              minRows={2}
              maxRows={4}
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

            <NumberInput
              label="Valor da Meta"
              placeholder="5000.00"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              key={form.key("monthlyGoal")}
              {...form.getInputProps("monthlyGoal")}
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
              Defina o valor que você deseja economizar para esta meta no mês
              atual.
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

      <Modal
        opened={saveModalOpened}
        onClose={handleCloseSaveModal}
        title="Guardar na Meta"
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
        <form onSubmit={handleSave}>
          <Stack gap="md">
            <NumberInput
              label="Valor a Guardar"
              placeholder="0.00"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              key={saveForm.key("amount")}
              {...saveForm.getInputProps("amount")}
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
              Digite o valor que deseja guardar nesta meta. O valor será
              adicionado ao total já guardado.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleCloseSaveModal}>
                Cancelar
              </Button>
              <Button type="submit" radius="sm">Guardar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
