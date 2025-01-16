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

const PermissionsArray = ["root", "admin", "cartao_facil", "cartao_facil_relatorio", "cartao_facil_vermelho", "cep_software", "fones"]

const PermissionsTranslationArray = {
    "root": "Usuário Raíz",
    "admin": "Administrador",
    "cartao_facil": "Cartão Fácil",
    "cartao_facil_relatorio": "Cartão Fácil (Relatórios)",
    "cartao_facil_vermelho": "Cartão Fácil (Vermelho)",
    "cep_software": "CEP Software",
    "fones": "Agenda Telefônica",
}

const PermissionsTooltipArray = {
    "root": "Não é possível tornar um usuário raíz por meio desta interface, apenas diretamente no banco de dados. Usuários raizes não podem ser deletados.",
    "admin": "Permissão máxima administrativa, pode adicionar/remover outros usuários. Com essa permissão ativa, este usuário terá acesso completo a todas as ferramentas.",
    "cartao_facil": "Permite que o usuário realize lançamentos no Cartão Fácil e verifique apenas seu último lançamento enviado.",
    "cartao_facil_relatorio": "Permite que o usuário veja todos os lançamentos do Cartão Fácil, podendo remover ou editar. Também é possível adicionar/remover formas de pagamento.",
    "cartao_facil_vermelho": "Permite que o usuário tenha acesso ao Cartão Fácil Vermelho para verificar quantos lançamentos seram necessários.", 
    "cep_software": "Permite que o usuário acesse a ferramenta CEP Software e realize a cotação dos motoboys.",
    "fones": "Permite que o usuário tenha acesso a agenda telefônica para consultas."
}

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
            console.log(data)
            reject(false)
        }

    } )
}

const Users = () => {

    const router = useRouter()
    const { notificationManager } = useNotification();

    const [users, setUsers] = useState({})
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState({});

    useEffect( () => {

        // Procedência de autenticação
        Authenticate()
        if (!hasPermission("admin")) {
            router.push("/hub")
        }

        PegarUsuariosBanco().then( (response) => {
            if (response) {
                setUsers(response)
                setIsLoaded(true)
            }
        } )

    }, [] )

    const OnArrowClicked = ({ target }) => {
        if (!(target.name in isOpen)) {
            isOpen[target.name] = false;
        }
        setIsOpen(
            { 
                ...isOpen, 
                [target.name]: !isOpen[target.name], 
                }
            )
    }

    const OnPermissionToggle = (user, index) => {
        console.log(user, index)
    }

    return (
        <div className={"container"}>

            {!isLoaded && <Loading/>}

            {isLoaded && 
            <div className={styles.vertical_container}>
                
                <ButtonContainer>
                    <Button title={"Voltar"} icon={"voltar"} onClick={ () => router.push("/hub") }/>
                    <Button title={"Adicionar Usuário"} icon={"addUser"}/>
                </ButtonContainer>

               <DropdownListContainer>

                    { users.map( (user, index) => {
                        return (
                            <div key={user.user}>

                                <DropdownItem 
                                    name={user.user} 
                                    title={user.user} 
                                    StateControl={isOpen} 
                                    onClick={OnArrowClicked}>
                                </DropdownItem>

                                <DropdownPermissions name={user.user} StateControl={isOpen}>
                                    {PermissionsArray.map( (permission, index) => {
                                        return <Permission 
                                            key={index}
                                            permission={permission}
                                            title={PermissionsTranslationArray[permission]} 
                                            tooltip={PermissionsTooltipArray[permission]} 
                                            user={user.user} 
                                            isOn={ () => permission in user.permissions } 
                                            onToggle={ OnPermissionToggle } >
                                        </Permission>
                                    } )}
                                </DropdownPermissions>
                            </div>
                        )
                    } ) }

               </DropdownListContainer>

            </div>
            }

        </div>

    )

}

export default Users