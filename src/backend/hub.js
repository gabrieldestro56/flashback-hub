import { encryptPassword } from './criptografia/criptografar.js'

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

const getUserByName = async(name) => {
  try {
    const Usuario = await BancoUsuarios.findOne({user: name})
    return Usuario || null
  } catch(e) { 
    console.log(e)
    return e
  }
}

const hasPermission = async(token, permission) => {
  try {
    const Usuario = await BancoUsuarios.findOne({password: token})
    return Usuario ? Usuario.permissions.includes(permission) : null
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

  // Verifica se o usuário tem permissão para usar esse end-point
  if ( !hasPermission(data.token, "admin") ) {
    res.status(401)
    return;
  }

  try {
    
    const Usuarios = await BancoUsuarios.find({}).toArray()
    const UsuariosPermissions = {}

    Usuarios.forEach( (user) => {
      UsuariosPermissions[user.user] = user.permissions
    } )

    if (Usuarios) {
      res.status(200).json(UsuariosPermissions)
    } else {
      res.status(401).json({message: "Nenhum usuário encontrado no banco."})
    }
  } catch(e) {
    console.log(e)
    return e
  }
}

export const AdicionarUsuario = async (req, res, data) => {

  data = JSON.parse(data)

  // Verifica se o usuário tem permissão para usar esse end-point
  if ( !hasPermission(data.token, "admin") ) {
    res.status(401)
    return;
  }

  // Verifica se os dados estão presentes
  if ( !(data.user) || data.user.Usuario === "" || data.user.Senha === "" ) {
    res.status(400)
    res.json({message: "Alguns campos não foram preenchidos. Não foi possível criar o usuário"})
    return;
  }

  // Verifica se esse usuário já não está cadastrado no banco
  console.log(await getUserByName(data.user.Usuario))
  if ( await getUserByName(data.user.Usuario) ) {
    res.status(400)
    res.json({message: `Usuário "${data.user.Usuario}" já existe, utilize outro nome de usuário.`})
    return;
  }

  // Adiciona o novo usuario ao banco
  const hashPassword = encryptPassword(data.user.Senha + process.env.SALT)

  try {

    const Usuario = await BancoUsuarios.insertOne({ user: data.user.Usuario, password: hashPassword, permissions: [] })

    console.log(Usuario)
    if (Usuario.acknowledged && Usuario.insertedId) {
      res.status(200)
      res.json({message: `Usuário ${data.user.Usuario} criado com sucesso!`})
      return true; 
    } else {
      res.status(500)
      res.json({message: "Erro interno do servidor."})
      return;
    }

  } catch(e) {
    res.status(500)
    res.json({message: e})
    return;
  }

}

export const RemoverUsuario = async (req, res, data) => {

  data = JSON.parse(data)

  // Verifica se o usuário tem permissão para usar esse end-point
  if ( !hasPermission(data.token, "admin") ) {
    res.status(401)
    return;
  }

  // Verifica esse usuario
  try {
    
    const Usuario = await getUserByName(data.user)

    // Verifica se o usuário existe
    if ( !(Usuario) ) {
      res.status(400).json({message: `${data.user} não é um usuário válido do banco.`})
      return; 
    }

    // Verifica se o usuário é root
    if ( Usuario.permissions.includes("root") ) {
      res.status(400).json({message: `${data.user} é um usuário raiz e não pode ser deletado.`})
      return;
    }

    // Verifica se o usuário é ele mesmo
    if ( Usuario.password === data.token ) {
      res.status(400).json({message: "Não é possivel deletar seu próprio usuário."})
      return;
    }

    // Deleta o usuário do banco
    const Resultado = await BancoUsuarios.deleteOne({user: data.user})

    if (Resultado.acknowledged) {
      res.status(200).json({message: `O usuário ${data.user} foi removido com sucesso!`})
      return true;
    } else {
      res.status(500).json({message: `Erro ao encontrar o usuário ${data.user}`})
      return;
    }

  } catch(e) {
    res.status(500).json({message: e})
    return;
  }

}

export const AtualizarUsuarios = async (req, res, data) => {

  data = JSON.parse(data)

  // Verifica se o usuário tem permissão para usar esse end-point
  if ( !hasPermission(data.token, "admin") ) {
    res.status(401)
    return;
  }

  let Erros = { count: 0, users: [], errorLogs: []};

  // Aplica as alterações no banco
  try {
    Object.keys(data.update).forEach( async (user, index) => {
      const result = await BancoUsuarios.updateOne( {user: user}, { $set: { permissions: data.update[user] } } )

      if (result === null || result === undefined || result.modifiedCount == 0) {
        Erros.count++;
        Erros.users.push(user)
      }

      // Retonar a resposta caso esteja no ultimo indice
      if (index === (Object.keys(data.update).length - 1)) {
        if (Erros.errorLogs.length == 0 && Erros.count == 0) {
          res.status(200).json({message: "Atualizações aplicadas com sucesso!"})
          return true;
        } else {
          res.status(500).json({message: "Ocorreu um erro ao aplicar as alterações. Verifique a log para mais informações.", log: Erros})
          return false;
        }
      }

    } )
  } catch(e) {
    Erros.errorLogs.push(e)
  } 

}