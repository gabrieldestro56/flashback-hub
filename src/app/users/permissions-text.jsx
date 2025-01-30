const PermissionsArray = ["root", "admin", "cartao_facil", "cartao_facil_relatorio", "cartao_facil_vermelho", "cep_software", "fones"]

const PermissionsTranslationArray = {
    "root": "Usuário Raíz",
    "admin": "Administrador",
    "cartao_facil": "Cartão Fácil",
    "cartao_facil_relatorio": "Cartão Fácil (Relatórios)",
    "cartao_facil_vermelho": "Cartão Fácil (Vermelho)",
    "cep_software": "CEP Software",
    "fones": "Agenda Telefônica",
}

const PermissionsTooltipArray = {
    "root": "Não é possível tornar um usuário raíz por meio desta interface, apenas diretamente no banco de dados. Usuários raizes não podem ser deletados.",
    "admin": "Permissão máxima administrativa, pode adicionar/remover outros usuários. Com essa permissão ativa, este usuário terá acesso completo a todas as ferramentas.",
    "cartao_facil": "Permite que o usuário realize lançamentos no Cartão Fácil e verifique apenas seu último lançamento enviado.",
    "cartao_facil_relatorio": "Permite que o usuário veja todos os lançamentos do Cartão Fácil, podendo remover ou editar. Também é possível adicionar/remover formas de pagamento.",
    "cartao_facil_vermelho": "Permite que o usuário tenha acesso ao Cartão Fácil Vermelho para verificar quantos lançamentos seram necessários.", 
    "cep_software": "Permite que o usuário acesse a ferramenta CEP Software e realize a cotação dos motoboys.",
    "fones": "Permite que o usuário tenha acesso a agenda telefônica para consultas."
}

export { PermissionsArray, PermissionsTooltipArray, PermissionsTranslationArray }