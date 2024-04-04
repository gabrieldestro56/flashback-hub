// Tabela de integridade
export const Integridade = {
    Usuario: [
      "AccountType",
      "Identification",
      "BusinessName",
      "OwnerName",
      "Email",
      "Phone",
      "Password",
    ]
}

// Verificação de integridade da data dos requests
export const integrityCheck = (received, expected) => {
  for (const field of expected) {
    if (!received[field]) {
      return false
    }
  }
  return true
}