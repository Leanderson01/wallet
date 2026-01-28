import { Group, Select } from "@mantine/core";

interface ExpenseFiltersProps {
  uniqueCategories: string[];
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
}

export function ExpenseFilters({
  uniqueCategories,
  categoryFilter,
  onCategoryFilterChange,
}: ExpenseFiltersProps) {
  return (
    <Group>
      <Select
        placeholder="Filtrar por categoria"
        clearable
        value={categoryFilter}
        onChange={onCategoryFilterChange}
        data={uniqueCategories}
        style={{ flex: 1, maxWidth: 300 }}
      />
    </Group>
  );
}
