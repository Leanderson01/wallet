"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Title,
  Text,
  Textarea,
  Stack,
  Group,
  Paper,
  ScrollArea,
  Loader,
  Center,
  ActionIcon,
} from "@mantine/core";
import { IconArrowRight, IconRobot, IconUser } from "@tabler/icons-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: number;
}

interface FormValues {
  message: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      message: "",
    },
    validate: {
      message: (value: string) =>
        value.trim().length === 0 ? "Mensagem não pode estar vazia" : null,
    },
  });

  const scrollToBottom = () => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = form.onSubmit(async (values: FormValues) => {
    const now = new Date().getTime();
    const userMessage: Message = {
      id: now.toString(),
      type: "user",
      text: values.message.trim(),
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsLoading(true);

    setTimeout(() => {
      const assistantNow = new Date().getTime();
      const assistantMessage: Message = {
        id: (assistantNow + 1).toString(),
        type: "assistant",
        text: "A integração com Groq SDK será implementada em breve. Esta é uma resposta de exemplo.",
        timestamp: assistantNow,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  });

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Stack gap={0} h="calc(100vh - 120px)" style={{ minHeight: "600px" }}>
      <div style={{ padding: "1rem 0" }}>
        <Title order={1} mb="xs" c="gray.0">
          Chat
        </Title>
        <Text c="gray.5" size="sm">
          Converse com a IA sobre seus gastos e receba orientações financeiras
        </Text>
      </div>

      <Paper
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1a1b1e",
          border: "1px solid #373a40",
          borderRadius: "md",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <ScrollArea
          viewportRef={viewport}
          style={{ flex: 1 }}
          p="md"
        >
          {messages.length === 0 ? (
            <Center h="100%" style={{ minHeight: "300px" }}>
              <Stack align="center" gap="md">
                <IconRobot size={48} color="#22C55E" />
                <Text c="gray.5" size="sm" ta="center">
                  Olá! Como posso ajudá-lo com suas finanças hoje?
                  <br />
                  Você pode me perguntar sobre seus gastos, receber
                  orientações ou registrar novos gastos.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md">
              {messages.map((message) => (
                <Group
                  key={message.id}
                  align="flex-start"
                  justify={message.type === "user" ? "flex-end" : "flex-start"}
                  gap="xs"
                >
                  {message.type === "assistant" && (
                    <Paper
                      p="xs"
                      style={{
                        backgroundColor: "#22C55E",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconRobot size={16} color="white" />
                    </Paper>
                  )}

                  <Stack gap={4} style={{ maxWidth: "70%" }}>
                    <Paper
                      p="md"
                      style={{
                        backgroundColor:
                          message.type === "user"
                            ? "#22C55E"
                            : "#141517",
                        border:
                          message.type === "user"
                            ? "none"
                            : "1px solid #373a40",
                        borderRadius: "md",
                      }}
                    >
                      <Text
                        c={message.type === "user" ? "white" : "gray.0"}
                        size="sm"
                      >
                        {message.text}
                      </Text>
                    </Paper>
                    <Text size="xs" c="gray.6" style={{ alignSelf: "flex-end" }}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </Stack>

                  {message.type === "user" && (
                    <Paper
                      p="xs"
                      style={{
                        backgroundColor: "#22C55E",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconUser size={16} color="white" />
                    </Paper>
                  )}
                </Group>
              ))}

              {isLoading && (
                <Group align="flex-start" gap="xs">
                  <Paper
                    p="xs"
                    style={{
                      backgroundColor: "#22C55E",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconRobot size={16} color="white" />
                  </Paper>
                  <Paper
                    p="md"
                    style={{
                      backgroundColor: "#141517",
                      border: "1px solid #373a40",
                      borderRadius: "md",
                    }}
                  >
                    <Loader size="sm" color="#22C55E" />
                  </Paper>
                </Group>
              )}
            </Stack>
          )}
        </ScrollArea>

        <Paper
          p="md"
          style={{
            borderTop: "1px solid #373a40",
            backgroundColor: "#1a1b1e",
          }}
        >
          <form onSubmit={handleSendMessage}>
            <div style={{ position: "relative" }}>
              <Textarea
                placeholder="Digite sua mensagem..."
                autosize
                minRows={2}
                maxRows={8}
                key={form.key("message")}
                {...form.getInputProps("message")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const formElement = e.currentTarget.closest("form");
                    if (formElement) {
                      formElement.requestSubmit();
                    }
                  }
                }}
                styles={{
                  input: {
                    backgroundColor: "#141517",
                    borderColor: "#373a40",
                    color: "#ced4da",
                    paddingRight: "48px",
                    "&:focus": {
                      borderColor: "#22C55E",
                    },
                  },
                }}
              />
              <ActionIcon
                type="submit"
                variant="subtle"
                color="#22C55E"
                size="lg"
                radius="md"
                disabled={isLoading}
                loading={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  const formElement = e.currentTarget.closest("form");
                  if (formElement) {
                    formElement.requestSubmit();
                  }
                }}
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "12px",
                  zIndex: 1,
                }}
              >
                <IconArrowRight size={20} />
              </ActionIcon>
            </div>
          </form>
        </Paper>
      </Paper>
    </Stack>
  );
}
