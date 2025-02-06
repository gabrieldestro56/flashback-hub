'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'

import Cookies from 'js-cookie';

import { useNotification } from '@/frontend/context/NotificationContext';
import { Authenticate, hasPermission } from '@/frontend/autenticacao/autenticacao';
import { Loading } from '@/frontend/components/Loading/Loading';
import { Button, ButtonContainer } from '@/frontend/components/Buttons/Button';
import { DropdownListContainer, DropdownItem, DropdownPermissions, Permission } from '@/frontend/components/DropdownList/DropdownList';
import { Popup } from '@/frontend/components/Popup/Popup';

const PegarPagamentosBanco = async() => {
    return new Promise( async (resolve, reject) => {

        // Requisita informações de usuários do banco
        const response = await fetch('/v1/get-payment-methods', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: Cookies.get("flashback_auth") })
        });
        
        const data = await response.json()

        if (response.status == 200) {
            resolve(data)
        } else {
            console.log(data)
            reject(false)
        }

    } )
}

const Payments = () => {

    const router = useRouter()
    const { notificationManager } = useNotification();

    const [payments, setPayments] = useState({})
    const [isLoaded, setIsLoaded] = useState(false);
    
    const [hasModified, setHasModified] = useState(false);
    const [isProcessingPush, setIsProcessingPush] = useState(false);

    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [createPaymentInfo, setCreatePaymentInfo] = useState({Nome: ""});

    const CarregarPagamentos = () => {
        setIsLoaded(false)
        PegarPagamentosBanco().then( (response) => {
            if (response) {
                setPayments(response.payments)
                setIsLoaded(true)
            }
        } )
    }

    useEffect( () => {

        // Procedência de autenticação
        Authenticate()
        if (!hasPermission("cartao_facil_relatorio")) {
            router.push("/cartao-facil")
        }

        CarregarPagamentos()

    }, [] )

    const onPushChanges = async () => {

        if (isProcessingPush || !hasModified) {
            return;
        }

        setIsProcessingPush(true)

        notificationManager.addNotification({
            type: "info",
            message: "Salvando alterações...",
            duration: 5000,
        });

        // Envia para o servidor as novas permissões
        const response = await fetch('/v1/update-payment-methods', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    token: Cookies.get("flashback_auth"),
                    payments: payments
                }
            )
        });

        const data = await response.json();

        notificationManager.addNotification({
            type: response.status === 200 ? "success" : "error",
            message: data.message,
            duration: response.status === 200 ? 5000 : 15000,
        })

        setIsProcessingPush(false)

        CarregarPagamentos()

    }

    const handleInputPopup = ({ target: {name, value} }) => {
        setCreatePaymentInfo({
            ...createPaymentInfo,
            [name]: value
        })
    }

    const onPopupButtonPress = async ( button ) => {
        
        // Desliga o pop up
        setIsCreatingPayment(false)

        // Função privada de erro no processo
        const Erro = (mensagem) => {
            notificationManager.addNotification({
                type: "error",
                message: mensagem,
                duration: 5000,
            })
            setCreatePaymentInfo({Nome: ""})
        }

        // Verifica se ambos os campos estão preenchidos
        if ( createPaymentInfo.Nome === "" ) {
            Erro("Preencha um nome para esse novo método de pagamento.")
            return;
        }

        // Verifica se esse método de pagamento já existe no front.
        if ( payments.includes(createPaymentInfo.Nome) ) {
            Erro("Esse pagamento já existe, utilize um nome diferente.")
            return;
        }

        // Envia as informações para o servidor
        const response = await fetch('/v1/create-payment', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    token: Cookies.get("flashback_auth"),
                    payment: createPaymentInfo.Nome,
                }
            )
        });

        const data = await response.json();

        notificationManager.addNotification({
            type: response.status === 200 ? "success" : "error",
            message: data.message,
            duration: 5000,
        })
        
        // Adiciona o pagamento ao array no sucesso
        if (response.status === 200) {
            setPayments( (oldPayments) => [...oldPayments, createPaymentInfo.Nome] )
        }

        // Limpa o state do pagamento
        setCreatePaymentInfo({Nome: ""})


    }

    const checkModification = () => {
        if (!hasModified) {
            notificationManager.addNotification({
                type: "info",
                message: "Ao finalizar, não se esqueça de \"Salvar Alterações\"",
                duration: 7000,
            });
            setHasModified(true)
        }
    }
 
    const removePayment = (payment) => {
        
        checkModification()

        setPayments( (oldPayments) => { 
            return oldPayments.filter( (element) => element !== payment )
         } )

    }

    const upPayment = (payment) => {
        setPayments((oldPayments) => {
            const index = oldPayments.indexOf(payment);
            if (index <= 0) return oldPayments;
    
            const newPayments = [...oldPayments]; 
            [newPayments[index], newPayments[index - 1]] = [newPayments[index - 1], newPayments[index]];
            
            return newPayments;
        });
        checkModification()
    };

    const downPayment = (payment) => {
        setPayments((oldPayments) => {
            const index = oldPayments.indexOf(payment);
            if (index >= payments.length - 1) return oldPayments;
    
            const newPayments = [...oldPayments]; 
            [newPayments[index], newPayments[index + 1]] = [newPayments[index + 1], newPayments[index]];

            return newPayments;
        });
        checkModification()
    }

    return (
        <div className={"container"}>

            {!isLoaded && <Loading/>}

            {isLoaded && 
            <div className={styles.vertical_container}>
                
                <ButtonContainer>
                    <Button title={"Voltar"} icon={"voltar"} onClick={ () => router.push("/cartao-facil") }/>
                    <Button title={"Adicionar Pagamento"} icon={"dinheiro"} onClick={ () => setIsCreatingPayment(true) }/>
                    <Button title={"Salvar Alterações"} icon={"salvar"} onClick={ onPushChanges } isDisabled={(isProcessingPush || !hasModified)}/>
                </ButtonContainer>

                { payments.map( (payment, index) => {
                    return (
                        <div key={index}> 
                            <button onClick={ () => upPayment(payment) }>Up</button>
                            <button onClick={ () => downPayment(payment) }>Down</button>
                            <a>{payment}</a>
                            <button onClick={ () => removePayment(payment) }>Delete</button>
                        </div> )
                } ) }   

                <DropdownListContainer>

                </DropdownListContainer>

                {isCreatingPayment && <Popup 
                    settings={ {
                        type: "form",

                        title: "Criar Método de Pagamento",
                        buttons: ["Criar"],

                        inputs: [ 
                            {
                                type: "text",
                                text: "Nome", 
                                value: createPaymentInfo["Nome"]
                            }, 
                        ],

                        onInputChanged: handleInputPopup,
                        onButtonPressed: onPopupButtonPress,

                        disableState: setIsCreatingPayment,
                        
                     } }>
                </Popup>}

            </div>
            }

        </div>

    )

}

export default Payments