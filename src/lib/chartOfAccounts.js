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