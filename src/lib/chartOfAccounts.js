export const CHART_OF_ACCOUNTS = [
  {
    code: "1", label: "ATIVO", children: [
      { code: "2", label: "ATIVO CIRCULANTE", children: [
        { code: "3", label: "DISPONÍVEL", children: [
          { code: "4", label: "CAIXA", children: [
            { code: "5", label: "CAIXA GERAL", categoria: "caixa_geral" },
          ]},
        ]},
        { code: "12", label: "CLIENTES", children: [
          { code: "13", label: "DUPLICATAS A RECEBER", categoria: "duplicatas_receber" },
        ]},
        { code: "53", label: "ESTOQUE", children: [
          { code: "54", label: "MERCADORIAS, PRODUTOS E INSUMOS", children: [
            { code: "55", label: "MERCADORIAS PARA REVENDA", categoria: "mercadorias_revenda" },
          ]},
        ]},
      ]},
    ],
  },
  {
    code: "149", label: "PASSIVO", children: [
      { code: "150", label: "PASSIVO CIRCULANTE", children: [
        { code: "164", label: "FORNECEDORES", categoria: "fornecedores" },
        { code: "169", label: "OBRIGAÇÕES TRIBUTÁRIAS", children: [
          { code: "170", label: "IMPOSTOS E CONTRIBUIÇÕES A RECOLHER", categoria: "impostos_recolher" },
        ]},
      ]},
    ],
  },
  {
    code: "269", label: "CONTAS DE RESULTADOS - CUSTOS E DESPESAS", children: [
      { code: "295", label: "DESPESAS OPERACIONAIS", children: [
        { code: "329", label: "DESPESAS ADMINISTRATIVAS", children: [
          { code: "330", label: "DESPESAS COM PESSOAL", categoria: "despesas_pessoal" },
          { code: "353", label: "DESPESAS GERAIS", categoria: "despesas_administrativas" },
        ]},
      ]},
    ],
  },
  {
    code: "402", label: "CONTAS DE RESULTADO - RECEITAS", children: [
      { code: "403", label: "RECEITAS OPERACIONAIS", children: [
        { code: "404", label: "RECEITA BRUTA DE VENDAS E SERVIÇOS", children: [
          { code: "408", label: "VENDA DE MERCADORIAS", categoria: "receita_vendas" },
        ]},
      ]},
    ],
  },
];

export const CATEGORIA_OPTIONS = [
  { value: "caixa_geral", label: "Caixa Geral (Disponível)" },
  { value: "duplicatas_receber", label: "Duplicatas a Receber (Clientes)" },
  { value: "mercadorias_revenda", label: "Mercadorias para Revenda (Estoque)" },
  { value: "fornecedores", label: "Fornecedores (Passivo)" },
  { value: "impostos_recolher", label: "Impostos e Contribuições a Recolher" },
  { value: "despesas_pessoal", label: "Despesas com Pessoal" },
  { value: "despesas_administrativas", label: "Despesas Administrativas Gerais" },
  { value: "receita_vendas", label: "Receita de Vendas/Serviços" },
];

// Maps a ContaContabil's "grupo" to the label of its top-level branch in
// CHART_OF_ACCOUNTS, so custom accounts created by the user can be attached
// to the correct section of the tree.
export const GRUPO_LABELS = {
  ativo: "ATIVO",
  passivo: "PASSIVO",
  despesas: "CONTAS DE RESULTADOS - CUSTOS E DESPESAS",
  receitas: "CONTAS DE RESULTADO - RECEITAS",
};

// Fixed group of each default/built-in account - used when creating an
// override record for a default account (renaming/hiding it).
export const BASE_ACCOUNT_GRUPO = {
  caixa_geral: "ativo",
  duplicatas_receber: "ativo",
  mercadorias_revenda: "ativo",
  fornecedores: "passivo",
  impostos_recolher: "passivo",
  despesas_pessoal: "despesas",
  despesas_administrativas: "despesas",
  receita_vendas: "receitas",
};

function findNodeByCategoria(tree, categoria) {
  for (const node of tree) {
    if (node.categoria === categoria) return node;
    if (node.children?.length) {
      const found = findNodeByCategoria(node.children, categoria);
      if (found) return found;
    }
  }
  return null;
}

// Returns CHART_OF_ACCOUNTS with each custom account (from the ContaContabil
// entity) appended as a leaf under its chosen group, and default accounts
// renamed if a matching override (base_categoria) exists.
export function buildChartWithCustom(customAccounts = []) {
  const tree = JSON.parse(JSON.stringify(CHART_OF_ACCOUNTS));
  (customAccounts || []).forEach((c) => {
    if (c.base_categoria) {
      const node = findNodeByCategoria(tree, c.base_categoria);
      if (node) node.label = c.label;
      return;
    }
    const groupNode = tree.find((n) => n.label === GRUPO_LABELS[c.grupo]);
    if (groupNode) {
      groupNode.children = groupNode.children || [];
      groupNode.children.push({ code: `custom-${c.id}`, label: c.label, categoria: `custom_${c.id}` });
    }
  });
  return tree;
}

// Options for the "Conta Contábil" select - excludes accounts hidden by the user.
export function buildCategoriaOptions(customAccounts = []) {
  const overridesByBase = {};
  (customAccounts || []).forEach((c) => { if (c.base_categoria) overridesByBase[c.base_categoria] = c; });
  const baseOptions = CATEGORIA_OPTIONS
    .filter((o) => !overridesByBase[o.value]?.hidden)
    .map((o) => ({ value: o.value, label: overridesByBase[o.value]?.label || o.label }));
  const customOptions = (customAccounts || [])
    .filter((c) => !c.base_categoria && !c.hidden)
    .map((c) => ({ value: `custom_${c.id}`, label: c.label }));
  return [...baseOptions, ...customOptions];
}

// Resolves a stored categoria value to its current display label - includes
// hidden/renamed accounts so historical lançamentos keep displaying correctly.
export function resolveCategoriaLabel(value, customAccounts = []) {
  const override = (customAccounts || []).find((c) => c.base_categoria === value);
  if (override) return override.label;
  const base = CATEGORIA_OPTIONS.find((o) => o.value === value);
  if (base) return base.label;
  const custom = (customAccounts || []).find((c) => `custom_${c.id}` === value);
  if (custom) return custom.label;
  return value;
}

// Full list of accounts (default + custom) for the account management dialog.
export function buildManagedAccountsList(customAccounts = []) {
  const overridesByBase = {};
  (customAccounts || []).forEach((c) => { if (c.base_categoria) overridesByBase[c.base_categoria] = c; });
  const baseItems = CATEGORIA_OPTIONS.map((o) => {
    const override = overridesByBase[o.value];
    return {
      key: o.value,
      label: override?.label || o.label,
      isBase: true,
      hidden: !!override?.hidden,
      overrideId: override?.id || null,
    };
  });
  const customItems = (customAccounts || [])
    .filter((c) => !c.base_categoria)
    .map((c) => ({ key: `custom_${c.id}`, label: c.label, grupo: c.grupo, isBase: false, hidden: !!c.hidden, id: c.id }));
  return [...baseItems, ...customItems];
}