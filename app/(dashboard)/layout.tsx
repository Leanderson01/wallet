"use client";

import { AppShell, Burger, Group, NavLink, Text, Avatar, Box, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const navItems = [
    { label: "Dashboard", href: "/", icon: "📊" },
    { label: "Despesas Fixas", href: "/fixed-expenses", icon: "💰" },
    { label: "Gastos Variáveis", href: "/variable-expenses", icon: "🛒" },
    { label: "Chat", href: "/chat", icon: "💬" },
    { label: "Metas", href: "/goals", icon: "🎯" },
    { label: "Configurações", href: "/settings", icon: "⚙️" },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        header: {
          backgroundColor: "#1a1b1e",
          borderBottom: "1px solid #373a40",
        },
        navbar: {
          backgroundColor: "#1a1b1e",
          borderRight: "1px solid #373a40",
          display: "flex",
          flexDirection: "column",
        },
        main: {
          backgroundColor: "#141517",
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="gray.0"
            />
            <Text size="lg" fw={700} c="gray.0">
              💰 Wallet
            </Text>
          </Group>
          <UserButton />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            leftSection={<Text size="lg">{item.icon}</Text>}
            active={pathname === item.href}
            onClick={(e) => {
              e.preventDefault();
              router.push(item.href);
              if (opened) {
                toggle();
              }
            }}
            mb="xs"
            variant={pathname === item.href ? "light" : "subtle"}
            styles={{
              label: {
                color: pathname === item.href ? "#22C55E" : "#ced4da",
                fontWeight: pathname === item.href ? 600 : 400,
              },
              root: {
                backgroundColor: pathname === item.href ? "rgba(34, 197, 94, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: pathname === item.href ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.05)",
                },
              },
            }}
          />
        ))}
        
        <Box
          style={{
            marginTop: "auto",
            paddingTop: "1rem",
            borderTop: "1px solid #373a40",
          }}
        >
          {isSignedIn && user ? (
            <Group gap="sm" p="xs">
              <Avatar
                src={user.imageUrl}
                alt={user.fullName || user.emailAddresses[0]?.emailAddress || "User"}
                size="sm"
              />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} c="gray.0" truncate>
                  {user.fullName || user.firstName || "Usuário"}
                </Text>
                {user.emailAddresses[0] && (
                  <Text size="xs" c="gray.5" truncate>
                    {user.emailAddresses[0].emailAddress}
                  </Text>
                )}
              </Box>
            </Group>
          ) : (
            <Box p="xs">
              <Text size="sm" c="gray.5" mb="xs">
                Faça login para continuar
              </Text>
              <SignInButton mode="modal">
                <Button size="xs" fullWidth variant="light" color="blue">
                  Entrar
                </Button>
              </SignInButton>
            </Box>
          )}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

