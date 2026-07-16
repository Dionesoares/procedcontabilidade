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

// Returns CHART_OF_ACCOUNTS with each custom account (from the ContaContabil
// entity) appended as a leaf under its chosen group.
export function buildChartWithCustom(customAccounts = []) {
  const tree = JSON.parse(JSON.stringify(CHART_OF_ACCOUNTS));
  (customAccounts || []).forEach((c) => {
    const groupNode = tree.find((n) => n.label === GRUPO_LABELS[c.grupo]);
    if (groupNode) {
      groupNode.children = groupNode.children || [];
      groupNode.children.push({ code: `custom-${c.id}`, label: c.label, categoria: `custom_${c.id}` });
    }
  });
  return tree;
}

// Returns CATEGORIA_OPTIONS plus one option per custom account, for use in
// the "Conta Contábil" select and for resolving labels in tables/reports.
export function buildCategoriaOptions(customAccounts = []) {
  return [...CATEGORIA_OPTIONS, ...(customAccounts || []).map((c) => ({ value: `custom_${c.id}`, label: c.label }))];
}