// Configura o environment
import { config } from 'dotenv';
config()

// Banco de Dados
import { MongoClient, ServerApiVersion } from 'mongodb';

const url = process.env.MONGODB_API_KEY;

const client = new MongoClient(url, {serverApi: {
  version: ServerApiVersion.v1,
  strict: true,
  deprecationErrors: true,
}})

const BancoGeral = client.db("flashbackhub")
const BancoUsuarios = BancoGeral.collection("users")

import { encryptPassword } from './criptografia/criptografar.js'

// Funções Auxiliares

// Verificação de senha para login
const isPasswordCorrect = async(user, password) => {
  try {
    const Usuario = await BancoUsuarios.findOne({user: user, password: password})
    return Usuario ? true : false 
  } catch(e) { 
    console.log(e)
    return e
  }
}

const getUserByToken = async(token) => {
  try {
    const Usuario = await BancoUsuarios.findOne({password: token})
    return Usuario || null
  } catch(e) { 
    console.log(e)
    return e
  }
}


// Funções interface
export const RealizarLogin = async (req, res, data) => {
  
  data = JSON.parse(data)
  
  const SenhaHash = encryptPassword(data.password + process.env.SALT)
  const SenhaCorreta = await isPasswordCorrect(data.user, SenhaHash)

  // Retorna erro
  if ( !SenhaCorreta ) {
    res.status(401).json({message: "Usuario ou senha incorreta."})
    return
  }

  const Usuario = await getUserByToken(SenhaHash)
  const Permissions = Usuario.permissions

  // Retorna o token para cookie
  res.status(200).json(
    {
      message: "Login realizado com sucesso!",
      token: SenhaHash,
      username: data.user,
      permissions: Permissions,
    }
  )

}

export const UsuarioAutenticado = async (req, res, data) => {
  return await getUserByToken(data.token)
}

export const RetornarUsuarios = async (req, res, data) => {

  try {
    const Usuarios = await BancoUsuarios.find({}).toArray()
    if (Usuarios) {
      res.status(200).json(Usuarios)
    } else {
      res.status(401).json({message: "Nenhum usuário encontrado no banco."})
    }
  } catch(e) {
    console.log(e)
    return e
  }
}