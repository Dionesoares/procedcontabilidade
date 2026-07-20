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
        { code: "18", label: "OUTROS CRÉDITOS", children: [
          { code: "28", label: "TRIBUTOS A RECUPERAR/COMPENSAR", children: [
            { code: "38", label: "INSS A COMPENSAR", categoria: "inss_a_compensar" },
          ]},
        ]},
        { code: "53", label: "ESTOQUE", children: [
          { code: "54", label: "MERCADORIAS, PRODUTOS E INSUMOS", children: [
            { code: "55", label: "MERCADORIAS PARA REVENDA", categoria: "mercadorias_revenda" },
          ]},
        ]},
      ]},
      { code: "501", label: "ATIVO NÃO-CIRCULANTE", children: [
        { code: "111", label: "IMOBILIZADO", children: [
          { code: "112", label: "IMÓVEIS", children: [
            { code: "113", label: "TERRENOS", categoria: "terrenos" },
          ]},
          { code: "118", label: "MÁQUINAS, EQUIPAMENTOS E FERRAMENTAS", children: [
            { code: "119", label: "MÁQUINAS E EQUIPAMENTOS", categoria: "maquinas_equipamentos" },
          ]},
          { code: "120", label: "VEÍCULOS", children: [
            { code: "121", label: "VEÍCULOS", categoria: "veiculos" },
          ]},
        ]},
      ]},
    ],
  },
  {
    code: "149", label: "PASSIVO", children: [
      { code: "150", label: "PASSIVO CIRCULANTE", children: [
        { code: "164", label: "FORNECEDORES", children: [
          { code: "165", label: "FORNECEDORES", categoria: "fornecedores" },
        ]},
        { code: "169", label: "OBRIGAÇÕES TRIBUTÁRIAS", children: [
          { code: "170", label: "IMPOSTOS E CONTRIBUIÇÕES A RECOLHER", children: [
            { code: "178", label: "IRRF A RECOLHER", categoria: "irrf_a_recolher" },
            { code: "479", label: "SIMPLES NACIONAL A RECOLHER", categoria: "simples_nacional_recolher" },
          ]},
        ]},
        { code: "185", label: "OBRIGAÇÕES TRABALHISTA E PREVIDENCIÁRIA", children: [
          { code: "186", label: "OBRIGAÇÕES COM O PESSOAL", children: [
            { code: "187", label: "SALÁRIOS E ORDENADOS A PAGAR", categoria: "salarios_a_pagar" },
            { code: "188", label: "PRÓ-LABORE A PAGAR", categoria: "pro_labore_a_pagar" },
          ]},
          { code: "190", label: "OBRIGAÇÕES SOCIAIS", children: [
            { code: "191", label: "INSS A RECOLHER", categoria: "inss_a_recolher" },
            { code: "192", label: "FGTS A RECOLHER", categoria: "fgts_a_recolher" },
          ]},
          { code: "193", label: "PROVISÕES", children: [
            { code: "194", label: "PROVISÕES PARA FÉRIAS", categoria: "provisoes_ferias" },
            { code: "195", label: "PROVISÕES PARA 13º SALÁRIO", categoria: "provisoes_13" },
            { code: "197", label: "INSS SOBRE PROVISÕES PARA 13º SALÁRIO", categoria: "inss_sobre_provisoes" },
            { code: "199", label: "FGTS SOBRE PROVISÕES PARA 13º SALÁRIO", categoria: "fgts_sobre_provisoes" },
          ]},
        ]},
      ]},
      { code: "242", label: "PATRIMÔNIO LÍQUIDO", children: [
        { code: "243", label: "CAPITAL SOCIAL", children: [
          { code: "244", label: "CAPITAL SUBSCRITO", children: [
            { code: "245", label: "CAPITAL SOCIAL", categoria: "capital_social" },
          ]},
        ]},
        { code: "264", label: "LUCROS OU PREJUÍZOS ACUMULADOS", children: [
          { code: "265", label: "LUCROS OU PREJUÍZOS ACUMULADOS", children: [
            { code: "266", label: "LUCROS ACUMULADOS", categoria: "lucros_acumulados" },
          ]},
        ]},
      ]},
    ],
  },
  {
    code: "269", label: "CONTAS DE RESULTADOS - CUSTOS E DESPESAS", children: [
      { code: "295", label: "DESPESAS OPERACIONAIS", children: [
        { code: "296", label: "DESPESAS COM VENDAS", children: [
          { code: "319", label: "DESPESAS GERAIS", children: [
            { code: "320", label: "ALUGUÉIS", categoria: "alugueis" },
            { code: "325", label: "SERVIÇOS PRESTADOS POR TERCEIROS", categoria: "servicos_terceiros" },
          ]},
        ]},
        { code: "329", label: "DESPESAS ADMINISTRATIVAS", children: [
          { code: "330", label: "DESPESAS COM PESSOAL", children: [
            { code: "331", label: "SALÁRIOS E ORDENADOS", categoria: "despesas_salarios" },
            { code: "336", label: "INSS", categoria: "despesas_inss" },
            { code: "337", label: "FGTS", categoria: "despesas_fgts" },
          ]},
          { code: "353", label: "DESPESAS GERAIS", children: [
            { code: "354", label: "ENERGIA ELÉTRICA", categoria: "energia_eletrica" },
            { code: "355", label: "ÁGUA E ESGOTO", categoria: "agua_esgoto" },
            { code: "359", label: "USO E CONSUMO", categoria: "uso_consumo" },
            { code: "361", label: "ASSISTÊNCIA CONTÁBIL", categoria: "assistencia_contabil" },
          ]},
        ]},
      ]},
    ],
  },
  {
    code: "402", label: "CONTAS DE RESULTADO - RECEITAS", children: [
      { code: "403", label: "RECEITAS OPERACIONAIS", children: [
        { code: "404", label: "RECEITA BRUTA DE VENDAS E SERVIÇOS", children: [
          { code: "410", label: "RECEITA DE PRESTAÇÃO DE SERVIÇOS", children: [
            { code: "411", label: "SERVIÇOS PRESTADOS", categoria: "servicos_prestados" },
          ]},
        ]},
        { code: "413", label: "(-) DEDUÇÕES DA RECEITA BRUTA", children: [
          { code: "424", label: "(-) IMPOSTOS SOBRE VENDAS E SERVIÇOS", children: [
            { code: "480", label: "(-) SIMPLES NACIONAL", categoria: "deducao_simples_nacional" },
          ]},
        ]},
      ]},
    ],
  },
];

export const CATEGORIA_OPTIONS = [
  { value: "caixa_geral", label: "Caixa Geral (Disponível)" },
  { value: "duplicatas_receber", label: "Duplicatas a Receber (Clientes)" },
  { value: "inss_a_compensar", label: "INSS a Compensar (Outros Créditos)" },
  { value: "mercadorias_revenda", label: "Mercadorias para Revenda (Estoque)" },
  { value: "terrenos", label: "Terrenos (Imobilizado)" },
  { value: "maquinas_equipamentos", label: "Máquinas e Equipamentos (Imobilizado)" },
  { value: "veiculos", label: "Veículos (Imobilizado)" },
  { value: "fornecedores", label: "Fornecedores (Passivo)" },
  { value: "irrf_a_recolher", label: "IRRF a Recolher" },
  { value: "simples_nacional_recolher", label: "Simples Nacional a Recolher" },
  { value: "salarios_a_pagar", label: "Salários e Ordenados a Pagar" },
  { value: "pro_labore_a_pagar", label: "Pró-labore a Pagar" },
  { value: "inss_a_recolher", label: "INSS a Recolher" },
  { value: "fgts_a_recolher", label: "FGTS a Recolher" },
  { value: "provisoes_ferias", label: "Provisões para Férias" },
  { value: "provisoes_13", label: "Provisões para 13º Salário" },
  { value: "inss_sobre_provisoes", label: "INSS sobre Provisões para 13º Salário" },
  { value: "fgts_sobre_provisoes", label: "FGTS sobre Provisões para 13º Salário" },
  { value: "capital_social", label: "Capital Social (Patrimônio Líquido)" },
  { value: "lucros_acumulados", label: "Lucros Acumulados (Patrimônio Líquido)" },
  { value: "alugueis", label: "Aluguéis (Despesas com Vendas)" },
  { value: "servicos_terceiros", label: "Serviços Prestados por Terceiros (Despesas com Vendas)" },
  { value: "despesas_salarios", label: "Salários e Ordenados (Despesas com Pessoal)" },
  { value: "despesas_inss", label: "INSS (Despesas com Pessoal)" },
  { value: "despesas_fgts", label: "FGTS (Despesas com Pessoal)" },
  { value: "energia_eletrica", label: "Energia Elétrica (Despesas Gerais)" },
  { value: "agua_esgoto", label: "Água e Esgoto (Despesas Gerais)" },
  { value: "uso_consumo", label: "Uso e Consumo (Despesas Gerais)" },
  { value: "assistencia_contabil", label: "Assistência Contábil (Despesas Gerais)" },
  { value: "servicos_prestados", label: "Serviços Prestados (Receita Bruta)" },
  { value: "deducao_simples_nacional", label: "(-) Simples Nacional (Dedução da Receita Bruta)" },
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
  inss_a_compensar: "ativo",
  mercadorias_revenda: "ativo",
  terrenos: "ativo",
  maquinas_equipamentos: "ativo",
  veiculos: "ativo",
  fornecedores: "passivo",
  irrf_a_recolher: "passivo",
  simples_nacional_recolher: "passivo",
  salarios_a_pagar: "passivo",
  pro_labore_a_pagar: "passivo",
  inss_a_recolher: "passivo",
  fgts_a_recolher: "passivo",
  provisoes_ferias: "passivo",
  provisoes_13: "passivo",
  inss_sobre_provisoes: "passivo",
  fgts_sobre_provisoes: "passivo",
  capital_social: "passivo",
  lucros_acumulados: "passivo",
  alugueis: "despesas",
  servicos_terceiros: "despesas",
  despesas_salarios: "despesas",
  despesas_inss: "despesas",
  despesas_fgts: "despesas",
  energia_eletrica: "despesas",
  agua_esgoto: "despesas",
  uso_consumo: "despesas",
  assistencia_contabil: "despesas",
  servicos_prestados: "receitas",
  deducao_simples_nacional: "receitas",
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