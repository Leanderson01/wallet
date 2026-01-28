"use client";

import { Modal, Stack, Text, Group, Button } from "@mantine/core";
import { modalStyles } from "@/app/lib/constants/themeStyles";

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  opened,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Excluir entrada?"
      size="md"
      styles={modalStyles}
    >
      <Stack gap="md">
        <Text size="sm" c="gray.5" mt="md">
          Tem certeza que deseja excluir esta entrada?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button color="red" variant="outline" radius="sm" onClick={onConfirm}>
            Excluir
          </Button>
          <Button variant="subtle" onClick={onClose}>
            Cancelar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
