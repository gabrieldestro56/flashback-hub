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
        AccountType: "Fornecedor", 
    })

    const [status, setStatus] = useState(1)
    const [passwordVisible, setPasswordVisible] = useState(false)

    const [error, setError] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const steps = {
      1: {
        title: "VAMOS COMEÇAR SEU CADASTRO!",
        subtitle: "Nos informe o tipo de cadastro e a identificação que você irá utilizar.",
      },
      2: {
        title: "CONTE-NOS SOBRE VOCÊ",
        subtitle: "Mais algumas informações sobre sua conta."
      },
      3: {
        title: "SEU CONTATO",
        subtitle: "Como podemos entrar em contato com você?"
      },
      4: {
        title: "SEU ACESSO",
        subtitle: "Vamos criar uma senha para seu acesso."
      },
      5: {
        title: "REVISAR OS DADOS",
        subtitle: "Verifique se todos os dados estão corretos antes de enviar." 
      }
    }

    const requirements = {
      1: ["User"],
      2: ["OwnerName", "BusinessName"],
      3: ["Email", "Phone"],
      4: ["Password", "PasswordMatch"],
    }

    const displayInfo = {
      "AccountType": "Tipo de Conta",
      "Identification": "Identificação",
      "User": "Identificador CNPJ/CPF",
      "Phone": "Telefone de contato",
      "Email": "E-mail de contato",
      "BusinessName": "Nome da Empresa",
      "OwnerName": "Nome do Representante",
    }

    const displayInfoOrder = ["AccountType", "Identification", "User", "BusinessName", "OwnerName", "Email", "Phone"]

    const getHtmlForStep = () => {
      const html = {
        1: () => {
          return(
          <div className={styles.form2}>
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
                <Alert variant="filled" severity="info">
                  Clientes podem apenas usar CNPJ
                </Alert>
                }  
            </div>  

            <InputMask className={styles.input} 
            mask={ credentials.Identification == "CPF" ? 
            "999.999.999-99" : "99.999.999/9999-99" } 
            onChange={handleChange} name="User" type="text" 
            placeholder={`Digite seu ${credentials.Identification}`} 
            value={credentials.User}/>

          </div> 
          )
        },
        2: () => {
          return (
            <div className={styles.form2}>
              <div className={styles.form2}>
                <input type="text" onChange={handleChange} name={"OwnerName"} className={styles.input} placeholder={"Nome do representante"} value={credentials.OwnerName} />
                <input type="text" onChange={handleChange} name={"BusinessName"} className={styles.input} placeholder={"Nome da empresa"} value={credentials.BusinessName} />
              </div>
            </div>
          )
        },
        3: () => {
          return (
            <div className={styles.form2}>
              <div className={styles.form2}>
                <InputMask className={styles.input} mask={ "+55 (99) 99999-9999" } onChange={handleChange} name="Phone" type="text" placeholder="Telefone" value={credentials.Phone} />
                <input type="text" onChange={handleChange} name={"Email"} className={styles.input} placeholder={"Email"} value={credentials.Email ? credentials.Email : ""} />
              </div>
            </div>
          )
        },
        4: () => { return( 
          <div className={styles.form2}>
            <input className={styles.input} onChange={handleChange} name="Password" type={passwordVisible ? "text" : "password"} placeholder="Senha" value={credentials.Password}></input>
            <input className={styles.input} onChange={handleChange} name="PasswordMatch" type={passwordVisible ? "text" : "password"} placeholder="Confirme sua Senha" value={credentials.PasswordMatch}></input>
            <label className={styles.subtitle}>
              <input type="checkbox" onChange={handlePasswordVisible} value={passwordVisible}/>
              Ver Senha
            </label>
          </div>
         )
        },
        5: () => { return (
          <div className={styles.form2}>
            { displayInfoOrder.map( (key) => {

              return ( 
                <div key={key} className={styles.form3}>
                  <span key={key} className={styles.aboveTitle}>{displayInfo[key]}</span>
                  <span key={key} className={styles.belowTitle}>{ credentials[key] }</span>
                </div>
              )

            } ) }
          </div>
        )}
      }
      return html[status]()
    }

    const handleChange = ({target}) => {
        const { name, value } = target;
        console.log(credentials)
        setCredentials( (previousCredentials) => (
        {
          ...previousCredentials,
            [name]: value,
            ...( value == "Cliente" ? {Identification: "CNPJ"} : {} )
        }
        )
      )
    }

    const handlePasswordVisible = () => {
      setPasswordVisible( (prev) => {
        return !prev
      } )
    }

    const handleEnviarCadastro = () => {

      // Desabilita o botão
      setDisabled(true)

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isFormFilledForStep = () => {
      for (const element of requirements[status]) {

        if (element == "Email" && !emailRegex.test(credentials.Email)) {
          setError("O email inserido é inválido.")
          return false
        }

        if (!credentials[element] || credentials[element].includes("_")) {
          setError("Alguns dados não foram preenchidos corretamente.")
          return false
        }

        if (element == "Password" && credentials.Password !== credentials.PasswordMatch) {
          setError("Suas senhas não coincidem.")
          return false
        }
        
      }
      return true
    }

    const handleProximo = () => {
      
      if (status === 5) {
        handleEnviarCadastro()
        return
      }

      if (!isFormFilledForStep()) {
        return false
      }

      setStatus( (prev) => {
        return prev + 1
      } )

      setError(false)

    }

    const handleVoltar = () => {
      if (status == 1) {
        return
      }
      setStatus( (prev) => {
        return prev - 1
      })
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

          <div className={styles.horizontalForm2}>
            { status > 1 ? <button className={ styles.button } onClick={handleVoltar}>Voltar</button> : null }
            <button className={disabled ? styles.buttonDisabled : styles.button} onClick={handleProximo}>{ status !== 5 ? "Proximo" : "Enviar"}</button>
          </div>

          { error ? <Alert variant="filled" severity="error">
            { error }
          </Alert> : null }

        </div>
      </div>
    );

}