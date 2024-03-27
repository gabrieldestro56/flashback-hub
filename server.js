// Configura o environment
require('dotenv').config()

// Prepara o servidor express com next
const express = require('express');
const next = require('next');
const port = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Criptografia para senhas
const sha256 = require('js-sha256')
const salt = process.env.SALT

// Banco de Dados
const { MongoClient } = require('mongodb')
const url = process.env.MONGODB_API_KEY

const client = new MongoClient(url)

const BancoGeral = client.db("AlguemConhece")
const BancoUsuarios = BancoGeral.collection("Usuarios")
const BancoUsuariosPendentes = BancoGeral.collection("UsuariosPendentes")

// Integridade dos Dados
const Integridade = {
  Usuario: [
    "AccountType",
    "Identification",
    "Name",
    "Email",
    "Password"
  ]
}

// Funções gerais

// Verificação de usuario já existente
const usuarioCadastrado = async ({User}) => {
  try {
    const Usuario = await BancoUsuarios.findOne({ User: User })
    return Usuario ? true : false
  } catch(e) {
    console.log(e)
    return e
  }
}

// Verificação de usuario pendente já existente
const usuarioPendenteCadastrado = async ({User}) => {
  try {
    const Usuario = await BancoUsuariosPendentes.findOne({ User: User })
    return Usuario ? true : false
  } catch(e) {
    console.log(e)
    return e
  }
}

// Verificação de integridade da data dos requests
const IntegrityCheck = (received, expected) => {
  expected.forEach( (field) => {
    if (!received[field]) {
      return false
    }
  } )
  return true
}

// Preparação do servidor
app.prepare().then(() => {

  const server = express();

  // API do Servidor
  server.post('/v1/cadastrar', (req, res) => {
    req.on('data', (data) => {

      data = JSON.parse(data)

      // Verificando se usuário já existe
      const Registrar = async () => {

        // Verificação de integridade do request
        if ( !IntegrityCheck(data, Integridade.Usuario) ) {
          return {type: "error", message: "Ocorreu uma falha de integridade dos dados."}
        }

        // Verificação se usuário já existe no banco
        if ( await usuarioCadastrado(data) ) {
          return {type: "error", message: "Esse usuário já foi cadastrado!"}
        }

        // Verificação se usuário já está pendente no banco
        if ( await usuarioPendenteCadastrado(data) ) {
          return {type: "error", message: "O processo deste usuário já está em andamento, favor aguardar!"}
        }

        // Criptografia da senha
        const SenhaSalt = data.Password + salt
        const SenhaCriptografada = sha256(SenhaSalt)

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

    } )
  });

  // Outros casos, renderizar com next
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Servidor online:  http://localhost:3000');
  });
});
