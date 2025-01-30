// Configura o environment
import { config } from 'dotenv';
config()

// Prepara o servidor express com next
import express from 'express'
import * as next from 'next'

const port = process.env.PORT || 3000;

const dev = process.env.NODE_ENV !== 'production';
const app = next.default({ dev });
const handle = app.getRequestHandler();

// Importa os protocolos da main
import * as hub from './src/backend/hub.js'

// Cache de tokens
let Tokens = {}

// Funções de auxílio
const getUnixTime = () => {
  return Math.floor( Date.now() / 1000 );
}

const isAuthenticated = async(req, res, data) => {

  data = JSON.parse(data)

  // Verifica se o token já está no cache e não excede 10 minutos
  if (data.token in Tokens && (getUnixTime() - Tokens[data.token].timestamp) <= 600 ) {
    res.status(200).json({message: "Token válido", permissions: Tokens[data.token].permissions})
    return true
  }

  const Usuario = await hub.UsuarioAutenticado(req, res, data)

  // Caso token seja inválido, retorna 401
  if (!Usuario) {
    res.status(401).json({message: "Token inválido."})
    return false
  }

  // Caso token seja válido, adiciona ao cache
  Tokens[Usuario.password] = {
    timestamp: getUnixTime(),
    permissions: Usuario.permissions
  }

  res.status(200).json({message: "Token válido", permissions: Usuario.permissions})

}

// Preparação do servidor
app.prepare().then(() => {

  const server = express();

  // Autenticação
  server.post('/v1/login', (req, res) => {
    req.on('data', (data) => hub.RealizarLogin(req, res, data))
  });

  server.post('/v1/auth', (req, res) => {
    req.on('data', (data) => isAuthenticated(req, res, data))
  })

  // Gerenciamento de Usuarios
  server.post('/v1/get-users', (req, res) => {
    req.on('data', (data) => hub.RetornarUsuarios(req, res, data))
  })

  server.post('/v1/create-user', (req, res) => {
    req.on('data', (data) => {
      if ( hub.AdicionarUsuario(req, res, data) ) {
        // Necessário limpar cache se a operação for sucedida
        Tokens = {}
      }
    })
  })

  server.post('/v1/delete-user', (req, res) => {
    req.on('data', (data) => {
      if ( hub.RemoverUsuario(req, res, data) ) {
          // Necessário limpar cache se a operação for sucedida
          Tokens = {}
      }
    })
  })

  server.post('/v1/set-users-permissions', (req, res) => {
    req.on('data', (data) => {
     if ( hub.AtualizarUsuarios(req, res, data) ) {
      // Necessário limpar cache se a operação for sucedida
      Tokens = {}
     }
    })
  })

  // Outros casos, renderizar com next
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log('> Servidor online:  http://localhost:' + port);
  });
});
