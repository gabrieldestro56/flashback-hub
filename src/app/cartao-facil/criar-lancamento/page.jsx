'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'

import Cookies from 'js-cookie';

import { useNotification } from '@/frontend/context/NotificationContext';
import { Authenticate, hasPermission } from '@/frontend/autenticacao/autenticacao';
import { Loading } from '@/frontend/components/Loading/Loading';
import { Button, ButtonContainer } from '@/frontend/components/Buttons/Button';

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
    const [isLoaded, setIsLoaded] = useState(false)

    const [lancamento, setLancamento] = useState({})

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
        if (!hasPermission("cartao_facil")) {
            router.push("/cartao-facil")
        }

        CarregarPagamentos()

    }, [] )

    const handleInputPopup = ({ target: {name, value} }) => {
        setCreatePaymentInfo({
            ...createPaymentInfo,
            [name]: value
        })
    }

    return (
        <div className={"container"}>

            {!isLoaded && <Loading/>}

            {isLoaded && 
            <div className={styles.vertical_container}>
                
                <ButtonContainer>
                    <Button title={"Voltar"} icon={"voltar"} onClick={ () => router.push("/cartao-facil") }/>
                </ButtonContainer>



            </div>
            }

        </div>

    )

}

export default Payments