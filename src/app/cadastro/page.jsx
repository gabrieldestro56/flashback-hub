'use client'

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import styles from './page.module.css'
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import InputMask from 'react-input-mask';

export default function Cadastro() {

    const router = useRouter()

    const [credentials, setCredentials] = useState({ 
        Identification: "CNPJ",
        AccountType: "Cliente", 
    })

    const [error, setError] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const getFormattingForTextType = (text, type) => {
      return (
        type == "CPF" 
        // Formatação para CPF
        ? text.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
        // Formatação para CNPJ
        : text.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2') 
      )  
    }

    const validateForm = () => {

      // Verifica o CPF/CNPJ
      if (!credentials.User || credentials.User === "__.___.___/____-__" || credentials.User === "___.___.___-__") {
        setError(`Insira um ${credentials.Identification} valido.`)
        return false
      }

      // Verifica o nome
      if (!credentials.Name) {
        setError("Informe o seu nome.")
        return false
      }

      // Verifica o email
      if (!credentials.Email) {
        setError("Informe seu e-mail.")
        return false
      }

      // Verifica o regex do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.Email)) {
        setError("Informe um e-mail válido.")
        return false
      }

      // Verifica se as senhas batem
      if (credentials.Password !== credentials.PasswordMatch) {
        setError("Sua senhas não coincidem.")
        return false
      }

      // Nenhum erro encontrado :D
      setError(false)
      return true

    }


    const handleChange = ({target}) => {
        const { name, value } = target;
        setCredentials( (previousCredentials) => (
        {
          ...previousCredentials,
            [name]: value,
            ...( value == "Cliente" ? {Identification: "CNPJ"} : {} )
        }
        )
      )
    }

    const handleEnviarCadastro = () => {

      // Desabilita o botão
      setDisabled(true)

      // Sanitização do form
      if ( !validateForm() ) {
        setDisabled(false)
        return false
      }

      // Remove excessos do credentials
      const Credentials = {...credentials}
      delete Credentials.PasswordMatch

      // Envia o POST request
      fetch('/v1/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Credentials), 
      })
      .then( (response) => {
        response.json()
        .then( (response) => {
          
          if (response.type == "success") {
            router.push('/processo')
            return
          }
          
          setError(response.message)
          setDisabled(false)

        } )

      } )

    }

    return (
      
      <div className={styles.mainContainer}>

        <Alert variant="filled" severity="warning">
            O design deste site é temporário e apenas contém as funcionalidades do software.
        </Alert>

        <div className={styles.form}>

        <div className={ `${ credentials.AccountType == "Fornecedor" ? styles.horizontalForm : styles.horizontalFormHidden }` }>
          <select className={styles.select} name="AccountType" value={credentials.AccountType} onChange={handleChange}>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Cliente">Cliente</option>
            </select>

          { credentials.AccountType == "Fornecedor" ? 
          <select className={styles.select} name="Identification" value={credentials.Identification} disabled={credentials.AccountType == "Cliente"} onChange={handleChange}>
              <option value="CNPJ">CNPJ</option>
              <option value="CPF">CPF</option>
          </select>
          : null }

        </div>

        <InputMask className={styles.input} mask={ credentials.Identification == "CPF" ? "999.999.999-99" : "99.999.999/9999-99" } onChange={handleChange} name="User" type="text" placeholder={credentials.Identification} value={credentials.User}></InputMask>
        <input className={styles.input} onChange={handleChange} name="Name" type="text" placeholder="Nome" value={credentials.Name}></input>
        <input className={styles.input} onChange={handleChange} name="Email" type="text" placeholder="E-mail" value={credentials.Email}></input>
        <input className={styles.input} onChange={handleChange} name="Password" type="password" placeholder="Senha" value={credentials.Password}></input>
        <input className={styles.input} onChange={handleChange} name="PasswordMatch" type="password" placeholder="Confirme sua Senha" value={credentials.PasswordMatch}></input>
        
        <button className={ disabled ? styles.buttonDisabled : styles.button } onClick={handleEnviarCadastro}>Enviar Cadastro</button>

        </div>

        { error ? <Alert variant="filled" severity="error">
            { error }
        </Alert> : null }

      </div>
    );

}