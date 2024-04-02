// Configura o environment
import { config } from 'dotenv';
config()

// Banco de Dados
import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_API_KEY

const client = new MongoClient(url, { connectTimeoutMS: 30000 }, { keepAlive: 1})

const BancoGeral = client.db("AlguemConhece")
const BancoUsuarios = BancoGeral.collection("Usuarios")
const BancoUsuariosPendentes = BancoGeral.collection("UsuariosPendentes")

import { integrityCheck, Integridade } from './sanitizacao/integridade.js'
import { encryptPassword } from './criptografia/criptografar.js'

// Funções Auxiliares
// Verificação de usuario já existente
export const isUserRegistered = async ({User}) => {
  try {
    const Usuario = await BancoUsuarios.findOne({ User: User })
    return Usuario ? true : false
  } catch(e) {
    console.log(e)
    return e
  }
}

// Verificação de usuario pendente já existente
export const isUserApprovalPending = async ({User}) => {
  try {
    const Usuario = await BancoUsuariosPendentes.findOne({ User: User })
    return Usuario ? true : false
  } catch(e) {
    console.log(e)
    return e
  }
}

// Funções
export const RealizarCadastro = (req, res, data) => {
    data = JSON.parse(data)

      // Registrando usuário
      const Registrar = async () => {

        // Verificação de integridade do request
        if ( !integrityCheck(data, Integridade.Usuario) ) {
          return {type: "error", message: "Ocorreu uma falha de integridade dos dados."}
        }

        // Verificação se usuário já existe no banco
        if ( await isUserRegistered(data) ) {
          return {type: "error", message: "Esse usuário já foi cadastrado!"}
        }

        // Verificação se usuário já está pendente no banco
        if ( await isUserApprovalPending(data) ) {
          return {type: "error", message: "O processo deste usuário já está em andamento, favor aguardar!"}
        }

        // Criptografia da senha
        const SenhaCriptografada = encryptPassword(data.Password)

        // Realiza o cadastro no banco de cadastros pedentes 
        try {
          await BancoUsuariosPendentes.insertOne(
            {
              ...data,
              ["Password"]: SenhaCriptografada, 
            }
          )
        } catch(e) {
          console.log(e)
          return {type: "error", message: e}
        }

        return {type: "success"}

      }

      // Executando a função e retornando resposta
      Registrar()
      .then( ( returnValue ) => {
        res.send(
          {...returnValue}
        )
      } )
}


