'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'

import Cookies from 'js-cookie';

import { useNotification } from '@/frontend/context/NotificationContext';
import { Authenticate, hasPermission } from '@/frontend/autenticacao/autenticacao';
import { Menu, MenuItem } from '@/frontend/components/Menu';
import { Loading } from '@/frontend/components/Loading';

const PegarUsuariosBanco = async() => {
    return new Promise( async (resolve, reject) => {

        // Requisita informações de usuários do banco
        const response = await fetch('/v1/get-users', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: Cookies.get("flashback_auth") })
        });
        
        const data = await response.json()

        if (response.status == 200) {
            resolve(data)
        } else {
            reject(data)
        }

    } )
}

const Users = () => {

    const router = useRouter()
    const { notificationManager } = useNotification();

    const [users, setUsers] = useState({})
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect( () => {

        // Procedência de autenticação
        Authenticate()
        if (!hasPermission("admin")) {
            router.push("/hub")
        }

        PegarUsuariosBanco().then( (response) => console.log(response) )

    }, [] )

    return (
        <div className={"container"}>

        </div>

    )

}

export default Users