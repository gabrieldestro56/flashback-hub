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

    const [status, setStatus] = useState(1)

    const [error, setError] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const steps = {
      1: {
        title: "VAMOS COMEÇAR!",
        subtitle: "Nos informe o tipo de cadastro e a identificação que você irá utilizar.",
      }
    }

    const getHtmlForStep = () => {
      const html = {
        1: () => {
          return(
          <div className={styles.horizontalForm}>
            <select className={styles.select} name="AccountType" value={credentials.AccountType} onChange={handleChange}>
             <option value="Fornecedor">Fornecedor</option>
             <option value="Cliente">Cliente</option>
            </select>
            { credentials.AccountType == "Fornecedor" ? 
              <select className={styles.select} name="Identification" value={credentials.Identification} disabled={credentials.AccountType == "Cliente"} onChange={handleChange}>
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
              </select>
              : 
              <span className={styles.info}>Clientes podem apenas usar CNPJ</span>
              }  
          </div> 
          )
        }
      }
      return html[status]()
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
        
          <span className={styles.title}> { steps[status].title } </span>
          <span className={styles.subtitle}>{ steps[status].subtitle }</span>

          {getHtmlForStep()}

        </div>

        { error ? <Alert variant="filled" severity="error">
            { error }
        </Alert> : null }

      </div>
    );

}