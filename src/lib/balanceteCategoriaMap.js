// Maps a free-text account description (from an uploaded spreadsheet) to one of
// our known balancete categories. Returns null when nothing matches (e.g. header
// or subtotal rows), so the caller can safely skip that row.
export function mapDescricaoToCategoria(descricao) {
  const d = (descricao || "").toUpperCase();

  if (d.includes("CAIXA")) return "caixa_geral";
  if (d.includes("DUPLICATA") || d.includes("CLIENTE")) return "duplicatas_receber";
  if (d.includes("MERCADORIA") || d.includes("ESTOQUE") || d.includes("PRODUTO")) return "mercadorias_revenda";
  if (d.includes("FORNECEDOR")) return "fornecedores";
  if (d.includes("IMPOSTO") || d.includes("TRIBUT") || d.includes("SIMPLES NACIONAL")) return "impostos_recolher";
  if (d.includes("PESSOAL") || d.includes("SALÁRIO") || d.includes("SALARIO") || d.includes("ORDENADO")) return "despesas_pessoal";
  if (d.includes("DESPESA") || d.includes("MATERIAL DE ESCRITÓRIO") || d.includes("ADMINISTRATIVA")) return "despesas_administrativas";
  if (d.includes("RECEITA") || d.includes("VENDA")) return "receita_vendas";

  return null;
}