const knex = require("../conexao");
const { dataTratada } = require("../uteis/data");

const listagemParametrosTabela = async (req, res) => {
  try {

    const tipos = await knex("categorias").select("categorias.id", "categorias.descricao as tipo");

    const tipoEsubtipos = await knex("sub_categorias")
    .join("categorias", "categorias.id", "sub_categorias.categoria_id")
    .select("sub_categorias.id",
    "sub_categorias.descricao as subtipo",
    "categorias.descricao as tipo");

    const subtipos = tipoEsubtipos.sort((a, b) =>
      a.subtipo.localeCompare(b.subtipo)
    );

    res.status(200).json({tipos, subtipos});
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor." });
  }
};

const cadastroFinanceiro = async (req, res) => {
  const { data, descricao, tipo, subtipo, valor } = req.body;

  const cadastroFinanceiro = {
    data,
    descricao,
    categoria_id: tipo,
    valor,
    usuario_id: req.usuario.id,
  };

  try {
    const [financeiro] = await knex("financeiro")
    .insert(cadastroFinanceiro)
    .returning(["descricao","valor","data"]);

    const categorias = await knex("financeiro")
      .join("categorias", "financeiro.categoria_id", "categorias.id")
      .where("categorias.id", tipo)
      .select("categorias.descricao as categoria")
      .first();

      const sub_categorias = await knex("financeiro")
      .join("sub_categorias", "financeiro.categoria_id", "sub_categorias.categoria_id")
      .where("sub_categorias.id", subtipo)
      .select("sub_categorias.descricao as sub_categoria")
      .first();

      financeiro.data = dataTratada(data);
      financeiro.tipo = categorias.categoria;
      financeiro.subtipo = sub_categorias.sub_categoria;
  
  res.status(201).json({"mensagem": "Cadastro financeiro feito com sucesso."});
  
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
};

const listaFinancas = async(req,res) => {

  try {
    const lista = await knex('financeiro').where("usuario_id",req.usuario.id);

    res.status(200).json(lista)
    
  } catch (error) {
    res.status(500).json({"mensagem": "Erro de servidor."})
  }
}

module.exports = {
  listagemParametrosTabela,
  cadastroFinanceiro,
  listaFinancas,
};
