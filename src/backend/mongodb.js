// Configura o environment
import { config } from 'dotenv';
config()

import { MongoClient, ServerApiVersion } from 'mongodb';

const url = process.env.MONGODB_API_KEY;

const client = new MongoClient(url, {serverApi: {
  version: ServerApiVersion.v1,
  strict: true,
  deprecationErrors: true,
}})

const BancoGeral = client.db("flashbackhub")

const BancoUsuarios = BancoGeral.collection("users")
const BancoPagamentos = BancoGeral.collection("pagamentos")

// Funções relacionadas a usuários e permissões
export const isPasswordCorrect = async(user, password) => {
  try {
    const Usuario = await BancoUsuarios.findOne({user: user, password: password})
    return Usuario ? true : false 
  } catch(e) { 
    console.log(e)
    return e
  }
}

export const getUserByToken = async(token) => {
  try {
    const Usuario = await BancoUsuarios.findOne({password: token})
    return Usuario || null
  } catch(e) { 
    console.log(e)
    return e
  }
}

export const getUserByName = async(name) => {
  try {
    const Usuario = await BancoUsuarios.findOne({user: name})
    return Usuario || null
  } catch(e) { 
    console.log(e)
    return e
  }
}

export const getAllUsers = async() => {
    try {
        const Usuarios = await BancoUsuarios.find({}).toArray()
        return Usuarios || null
    } catch(e) {
        console.log(e)
        return e
    }
}

export const hasPermission = async(token, permission) => {
  try {
    const Usuario = await BancoUsuarios.findOne({password: token})
    return Usuario ? Usuario.permissions.includes(permission) : null
  } catch(e) { 
    console.log(e)
    return e
  }
}

export const insertUser = async(parameters) => {
    try {
        const Usuario = await BancoUsuarios.insertOne(parameters)
        return (Usuario.acknowledged && Usuario.insertedId) 
    } catch(e) {
        console.log(e)
        return e
    }
}

export const updateUser = async(filter, parameters) => {
    try {
        const Usuario = await BancoUsuarios.updateOne(filter, parameters)
        return (Usuario.acknowledged && (Usuario.modifiedCount >= 1))
    } catch(e) {
        console.log(e)
        return e
    }
}

export const deleteUser = async(filter) => {
    try {
        const Usuario = await BancoUsuarios.deleteOne(filter)
        return (Usuario.acknowledged && (Usuario.deletedCount >= 1))
    } catch(e) {
        console.log(e)
        return e
    }
}

// Funções relacionadas ao Cartão Facil
export const addPaymentMethod = async(payment) => {
    try {
        const Pagamentos = await BancoPagamentos.updateOne({}, { $addToSet: { payments: payment } })
        console.log(Pagamentos)
        return (Pagamentos.acknowledged && (Pagamentos.modifiedCount >= 1))
    } catch(e) {
        console.log(e)
        return e
    }
}

export const getPaymentMethods = async() => {
    try { 
        const Pagamentos = await BancoPagamentos.findOne({})
        return (Pagamentos.payments)
    } catch(e) {
        console.log(e)
        return e
    }
}

export const updatePaymentMethods = async(payments) => {
    try {
        const Pagamentos = await BancoPagamentos.updateOne({}, { $set: { payments: payments } })
        return (Pagamentos.acknowledged && (Pagamentos.modifiedCount >= 1))
    } catch(e) {
        console.log(e)
        return e
    }
}
