// Tabela de integridade
export const Integridade = {
    Usuario: [
      "AccountType",
      "Identification",
      "Name",
      "Email",
      "Password"
    ]
}

// Verificação de integridade da data dos requests
export const integrityCheck = (received, expected) => {
  expected.forEach( (field) => {
    if (!received[field]) {
      return false
    }
  } )
  return true
}