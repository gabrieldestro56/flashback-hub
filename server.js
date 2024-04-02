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
import * as backend from './backend/main.js'

// Preparação do servidor
app.prepare().then(() => {

  const server = express();

  // API do Servidor
  server.post('/v1/cadastrar', (req, res) => {
    req.on('data', (data) => backend.RealizarCadastro(req, res, data) )
  });

  // Outros casos, renderizar com next
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log('> Servidor online:  http://localhost:' + port);
  });
});
