"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import Cookies from "js-cookie";

import { useNotification } from "@/frontend/context/NotificationContext";
import {
  Authenticate,
  hasPermission,
} from "@/frontend/autenticacao/autenticacao";

import { Loading } from "@/frontend/components/Loading/Loading";
import { Button, ButtonContainer } from "@/frontend/components/Buttons/Button";

import InputMask from "react-input-mask";
import { handleClientScriptLoad } from "next/script";

const PegarPagamentosBanco = async () => {
  return new Promise(async (resolve, reject) => {
    // Requisita informações de usuários do banco
    const response = await fetch("/v1/get-payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: Cookies.get("flashback_auth") }),
    });

    const data = await response.json();

    if (response.status == 200) {
      resolve(data);
    } else {
      console.log(data);
      reject(false);
    }
  });
};

const Payments = () => {
  const router = useRouter();
  const { notificationManager } = useNotification();

  const [payments, setPayments] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [phase, setPhase] = useState(1);

  const [lancamento, setLancamento] = useState({
    ["pagamentos"]: {},
    ["data"]: new Date().toISOString().split("T")[0],
  });

  const CarregarPagamentos = () => {
    setIsLoaded(false);
    PegarPagamentosBanco().then((response) => {
      if (response) {
        setPayments(response.payments);
        setIsLoaded(true);
      }
    });
  };

  useEffect(() => {
    // Procedência de autenticação
    Authenticate();
    if (!hasPermission("cartao_facil")) {
      router.push("/cartao-facil");
    }

    CarregarPagamentos();
  }, []);

  const convertCurrencyToNumber = (currencyString) => {
    return Number(currencyString.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  };

  const formatCurrency = (value) => {
    if (!value) return "";

    const numericValue = value.replace(/\D/g, "");

    const formattedValue = (Number(numericValue) / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }
    );

    return formattedValue;
    
  };

  const handlePaymentChange = ({ target: { name, value } }) => {
    setLancamento((oldLancamento) => {
      return {
        ...oldLancamento,
        ["pagamentos"]: {
          ...oldLancamento["pagamentos"],
          [name]: formatCurrency(value),
        },
      };
    });
  };

  const handleGastosChange = ({target: {value}}) => {
    setLancamento((oldLancamento) => {
        return {
            ...oldLancamento,
            ["gastos"]:{ 
                ...oldLancamento["gastos"],
                ["value"]: formatCurrency(value),
            },
        }
    })
  }

  const handleDescricaoChange = ({target: {value}}) => {
    setLancamento((oldLancamento) => {
        return {
            ...oldLancamento,
            ["gastos"]: {
                ...oldLancamento["gastos"],
                ["descricao"]: value,
            }
        }
    })
  }

  const handleDateChange = ({ target: { value } }) => {
    setLancamento((oldLancamento) => {
      return { ...oldLancamento, ["data"]: value };
    });
  };

  const onPush = () => {
    
    // Copia o estado atual
    const LancamentoPendente = {...lancamento}

    // Adiciona os pagamentos que não foram preenchidos


  }
  
  return (
    <div className={"container"}>
      {!isLoaded && <Loading />}

      {isLoaded && (
        <div className={styles.vertical_container}>

          <ButtonContainer>
            <Button
              title={"Sair"}
              icon={"voltar"}
              onClick={() => router.push("/cartao-facil")}
            />
            <Button
              title={"Salvar Lançamento"}
              icon={"salvar"}
              onClick={() => router.push("/cartao-facil")}
            />
          </ButtonContainer>

          <div className={styles["lancamento-container"]}>  

            <div className={styles["lancamento-header"]}>
              
              <a className={styles.title}>Criação de Lançamento</a>

                <input
                  className={styles.date_selector}
                  type={"date"}
                  value={lancamento.data}
                  onChange={handleDateChange}
                />

            </div>

            <div className={styles["lancamento-pagamentos"]}>
              { payments.map( (pagamento) => {
              return <div key={pagamento} className={styles["lancamento-individual"]}>
                  <a>{pagamento}</a>
                  <input
                  value={lancamento["pagamentos"][pagamento]}
                  placeholder="R$ 0,00"
                  />
              </div>
            } ) }
            </div>

            <div className={styles["lancamento-despesas"]}>
               <div className={styles["lancamento-despesas-value"]}>
                <a>Despesas: </a>
                <input
                value={lancamento.despesas?.value}
                placeholder="R$ 0,00"
                />
               </div>

            <textarea
                placeholder={"Elaboração de despesas..."}
                rows={2}
                cols={5}
                className={styles["lancamento-despesas-descricao"]}
                value={lancamento.despesas?.descricao}
            ></textarea>

            </div>

          </div>


        </div>
      )}
    </div>
  );
};

export default Payments;
