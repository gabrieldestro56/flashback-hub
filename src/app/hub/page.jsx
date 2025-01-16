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

    const HandleLogout = () => {

        // Remove os cookies do site
        Cookies.remove("flashback_auth")
        Cookies.remove("permissions")
        Cookies.remove("username")

        // Manda o usuário para o login
        router.push("/")

    }

    return (
        <div className={styles.container}>

        { !isLoaded && <div className={styles.container}>
            <Loading></Loading>
        </div>}

        { isLoaded &&
        <div className={styles.container_row}>
           <label className={styles.title}>{`Bem-vindo, ${Cookies.get("username")}!`}</label>
            <Menu>
                { (hasPermission("admin") || hasPermission("cartao_facil")) && <MenuItem name={"Cartão Fácil"} icon={"cartao_facil"}/>}
                { (hasPermission("admin") || hasPermission("ceo_software")) && <MenuItem name={"CEP Software"} icon={"delivery"}/>}
                { (hasPermission("admin") || hasPermission("fones")) && <MenuItem name={"Agenda Telefônica"} icon={"fones"}/>}
                { hasPermission("admin") && <MenuItem name={"Gerenciar Usuários"} icon={"usuarios"} onClick={() => router.push("/users")}/>}
                <MenuItem name={"Trocar de Usuário"} icon={"logout"} onClick={HandleLogout}></MenuItem>
            </Menu>
        </div> }
        </div>
    )
}

export default Hub;