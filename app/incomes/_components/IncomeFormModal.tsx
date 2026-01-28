"use client";

import type { FormEventHandler } from "react";
import {
  Modal,
  Stack,
  NumberInput,
  Group,
  Button,
  Switch,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { modalStyles, inputStyles, switchStyles } from "@/app/lib/constants/themeStyles";
import { INCOME_TYPE, isFixed } from "@/app/lib/constants/incomeTypes";
import type { UseFormReturnType } from "@mantine/form";
import type { Income, IncomeFormValues } from "@/app/lib/types/incomes";
import "@mantine/dates/styles.css";

interface IncomeFormModalProps {
  opened: boolean;
  onClose: () => void;
  editingIncome: Income | null;
  form: UseFormReturnType<IncomeFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onReset: () => void;
}

export function IncomeFormModal({
  opened,
  onClose,
  editingIncome,
  form,
  onSubmit,
  onReset,
}: IncomeFormModalProps) {
  const type = form.values.type;
  const typeMeta = INCOME_TYPE[type];
  const fixed = isFixed(type);

  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={editingIncome ? "Editar Entrada" : "Nova Entrada"}
      size="md"
      styles={modalStyles}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <Switch
            mt="md"
            label={typeMeta.switchLabel}
            description={typeMeta.switchDescription}
            checked={fixed}
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
            styles={switchStyles}
          />

          {fixed ? (
            <NumberInput
              label="Dia do Mês"
              placeholder="Ex: 5, 15, 30"
              required
              min={1}
              max={31}
              {...form.getInputProps("dayOfMonth")}
              styles={inputStyles}
            />
          ) : (
            <DateInput
              label="Data do Recebimento"
              placeholder="Selecione a data"
              required
              {...form.getInputProps("paymentDate")}
              styles={inputStyles}
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
                  setTimeout(() => formElement.requestSubmit(), 0);
                }
              }
            }}
            styles={inputStyles}
          />

          <Text size="xs" c="gray.6">
            {typeMeta.footerText}
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" radius="sm">
              {editingIncome ? "Atualizar" : "Criar"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
