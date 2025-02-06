import {
    getPaymentMethods,
    updatePaymentMethods,
    addPaymentMethod,
    hasPermission,
} from './mongodb.js';

// Funções de métodos de pagamento
export const criarMetodoPagamento = async(req, res, data) => {
    
    data = JSON.parse(data)

    if (!hasPermission(data.token, "cartao_facil_relatorio")) {
        res.status(401)
        return;
    }

    if (!data.payment) {
        res.status(400)
        return;
    }

    const resultado = await addPaymentMethod(data.payment)

    if (resultado) {
        res.status(200).json({message: `Método ${data.payment} adicionado com sucesso!`})
    } else {
        res.status(500).json({message: `Ocorreu um erro ao adicionar ${data.payment}`})
    }

}

export const retornarMetodosPagamento = async(req,  res, data) => {
    
   data = JSON.parse(data)

    if (!hasPermission(data.token, "cartao_facil_relatorio")) {
        res.status(401)
        return;
    }

    const payments = await getPaymentMethods()

    res.status(200).json({payments: payments})

}

export const atualizarMetodosPagamento = async(req, res, data) => {

    data = JSON.parse(data)

    if (!hasPermission(data.token, "cartao_facil_relatorio")) {
        res.status(401)
        return;
    }

    if (!data.payments || (data.payments && (data.payments === "" || data.payments.length == 0)) ) {
        res.status(400).json({message: "É necessário que exista pelo menos um pagamento."})
        return;
    }

    const resultado = await updatePaymentMethods(data.payments)

    if (resultado) {
        res.status(200).json({message: "Pagamentos atualizados com sucesso!"})
    } else {
        res.status(500).json({message: "Ocorreu um erro ao atualizar os pagamentos."})
    }

}