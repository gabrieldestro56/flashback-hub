'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'

import Cookies from 'js-cookie';

import { useNotification } from '@/frontend/context/NotificationContext';
import { Authenticate, hasPermission } from '@/frontend/autenticacao/autenticacao';
import { Menu, MenuItem } from '@/frontend/components/Menu/Menu';
import { Loading } from '@/frontend/components/Loading/Loading';

const Hub = () => {

    const router = useRouter()
    const { notificationManager } = useNotification();

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect( () => {
        Authenticate(router, notificationManager)
        setIsLoaded(true)
    }, [] )

    const HandleVoltar = () => {
        router.push("/hub")
    }

    return (
        <div className={styles.container}>

        { !isLoaded && <div className={styles.container}>
            <Loading></Loading>
        </div>}

        { isLoaded &&
        <div className={styles.container_row}>
           <label className={styles.title}>Cartão Fácil</label>
            <Menu>
                { (hasPermission("admin") || hasPermission("cartao_facil")) && <MenuItem onClick={() => router.push('/cartao-facil/criar-lancamento')} name={"Fazer Lançamento"} icon={"novolancamento"}/>}
                { (hasPermission("admin") || hasPermission("cartao_facil")) && <MenuItem name={"Resultado do Dia"} icon={"lancamentodia"}/>}
                { (hasPermission("admin") || hasPermission("cartao_facil_vermelho")) && <MenuItem name={"Cartão Vermelho"} icon={"cartaovermelho"}/>}
                { (hasPermission("admin") || hasPermission("cartao_facil_relatorio")) && <MenuItem onClick={() => router.push('/cartao-facil/metodos-pagamento')} name={"Métodos de Pagamento"} icon={"metodopagamento"}/>}
                { (hasPermission("admin") || hasPermission("cartao_facil_relatorio")) && <MenuItem name={"Relatório"} icon={"relatorio"}/>}
                <MenuItem name={"Voltar"} icon={"logout"} onClick={HandleVoltar}></MenuItem>
            </Menu>
        </div> }
        </div>
    )
}

export default Hub;