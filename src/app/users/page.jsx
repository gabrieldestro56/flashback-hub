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

import { PermissionsArray, PermissionsTooltipArray, PermissionsTranslationArray } from './permissions-text';

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
    const [originalUsers, setOriginalUsers] = useState({})
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState({});

    const [hasBeenToggled, setHasBeenToggled] = useState(false);
    const [isProcessingPush, setIsProcessingPush] = useState(false);

    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createUserInfo, setCreateUserInfo] = useState({Usuario: "", Senha: ""});

    const CarregarUsuarios = () => {
        setIsLoaded(false)
        PegarUsuariosBanco().then( (response) => {
            if (response) {
                setUsers(response)
                setOriginalUsers(response)
                setIsLoaded(true)
            }
        } )
    }

    useEffect( () => {

        // Procedência de autenticação
        Authenticate()
        if (!hasPermission("admin")) {
            router.push("/hub")
        }

        CarregarUsuarios()

    }, [] )

    const onArrowClicked = ({ target }) => {
        if (!(target.name in isOpen)) {
            isOpen[target.name] = false;
        }
        setIsOpen(
                { 
                    [target.name]: !isOpen[target.name], 
                }
            )
    }

    const onTrashcan = async (name) => {
        
        // Verifica se o usuário é ele mesmo
        if ( Cookies.get('username') === name) {
            return;
        }

        // Verifica se o alvo é root
        if ( users[name].includes("root") ) {
            return;
        }

        // Envia as informações para o servidor
        const response = await fetch('/v1/delete-user', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    token: Cookies.get("flashback_auth"),
                    user: name,
                }
            )
        });

        const data = await response.json();

        notificationManager.addNotification({
            type: response.status === 200 ? "success" : "error",
            message: data.message,
            duration: 5000,
        })

        CarregarUsuarios()
        
    }

    const onPermissionToggle = (user, permission) => {
        
        if (!hasBeenToggled) {
            notificationManager.addNotification({
                type: "info",
                message: "Ao finalizar, não se esqueça de \"Salvar Alterações\"",
                duration: 7000,
            });
            setHasBeenToggled(true)
        }

        // Protege as permissões chave
        if (permission === "root") {
            return;
        }

        if (permission === "admin" && Cookies.get("username") === user) {
            return;
        }

        // Faz o toggle da permissão no usuario alvo
        setUsers( (users) => {
            return {
              ...users,
              [user]: users[user].includes(permission)
                ? // Remove a permissão caso estiver incluida
                  users[user].filter((perm) => perm !== permission)
                : // Adiciona a permissão caso contrário
                  [...users[user], permission],
            };
        } )    
    }

    const LimparPermissionsInalteradas = () => {
        const result = { ...users };
    
        for (const user in users) {
            if (
                originalUsers[user] &&
                originalUsers[user].length === users[user].length &&
                originalUsers[user].every((perm) => users[user].includes(perm))
            ) {
                delete result[user];
            }
        }
    
        return result;
    }

    const onPushChanges = async () => {

        if (isProcessingPush || !hasBeenToggled) {
            return;
        }

        setIsProcessingPush(true)

        notificationManager.addNotification({
            type: "info",
            message: "Salvando alterações...",
            duration: 5000,
        });

        // Compara as mudanças ao original e remove do POST usuários que não foram modificados
        const UpdatePermissions = LimparPermissionsInalteradas();

        // Envia para o servidor as novas permissões
        const response = await fetch('/v1/set-users-permissions', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    token: Cookies.get("flashback_auth"),
                    update: UpdatePermissions
                }
            )
        });

        const data = await response.json();

        notificationManager.addNotification({
            type: response.status === 200 ? "success" : "error",
            message: data.message,
            duration: response.status === 200 ? 5000 : 15000,
        })

        if (response.status !== 200) {

            notificationManager.addNotification({
                type: "error",
                message: "Erro ao modificar usuários: " + data.log.users,
                duration: 15000,
            })

            console.log("[ERRO BANCO DE DADOS]")
            console.log(`\n\nQuantidade de erros: ${data.log.count}\n\nUsuarios afetados: ${data.log.users}\n\nLogs: ${data.log.errorLogs}`)

        }

        setIsProcessingPush(false)

    }

    const handleInputPopup = ({ target: {name, value} }) => {
        setCreateUserInfo({
            ...createUserInfo,
            [name]: value
        })
    }

    const onPopupButtonPress = async ( button ) => {
        
        // Desliga o pop up
        setIsCreatingUser(false)

        // Função privada de erro no processo
        const Erro = (mensagem) => {
            notificationManager.addNotification({
                type: "error",
                message: mensagem,
                duration: 5000,
            })
            setCreateUserInfo({Usuario: "", Senha: ""})
        }

        // Verifica se ambos os campos estão preenchidos
        if ( createUserInfo.Usuario === "" || createUserInfo.Senha === "" ) {
            Erro("Preencha um usuário e senha para poder criar um novo usuario.")
            return;
        }

        // Verifica se esse usuário já existe no front
        if ( Object.keys(users).includes(createUserInfo.Usuario) ) {
            Erro("Esse usuário já existe, utilize um nome diferente.")
            return;
        }

        // Envia as informações para o servidor
        const response = await fetch('/v1/create-user', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { 
                    token: Cookies.get("flashback_auth"),
                    user: createUserInfo,
                }
            )
        });

        const data = await response.json();

        notificationManager.addNotification({
            type: response.status === 200 ? "success" : "error",
            message: data.message,
            duration: 5000,
        })
        
        // Limpa o state do usuario e senha
        setCreateUserInfo({Usuario: "", Senha: ""})

        // Atualiza a lista de usuarios
        CarregarUsuarios()

    }



    return (
        <div className={"container"}>

            {!isLoaded && <Loading/>}

            {isLoaded && 
            <div className={styles.vertical_container}>
                
                <ButtonContainer>
                    <Button title={"Voltar"} icon={"voltar"} onClick={ () => router.push("/hub") }/>
                    <Button title={"Adicionar Usuário"} icon={"addUser"} onClick={ () => setIsCreatingUser(true) }/>
                    <Button title={"Salvar Alterações"} icon={"salvar"} onClick={ onPushChanges } isDisabled={(isProcessingPush || !hasBeenToggled)}/>
                </ButtonContainer>

               <DropdownListContainer>

                    { Object.keys(users).map( (user) => {
                        return (
                            <div key={user}>
                                <DropdownItem 
                                    name={user} 
                                    title={user} 
                                    StateControl={isOpen} 
                                    onClick={onArrowClicked}
                                    onDelete={onTrashcan}
                                    isRoot={ users[user].includes("root") }>
                                </DropdownItem>

                                <DropdownPermissions name={user} StateControl={isOpen}>
                                    {PermissionsArray.map( (permission, index) => {
                                        return <Permission 
                                            key={index}
                                            permission={permission}
                                            title={PermissionsTranslationArray[permission]} 
                                            tooltip={PermissionsTooltipArray[permission]} 
                                            user={user} 
                                            isOn={ users[user].includes(permission) } 
                                            onToggle={ onPermissionToggle } >
                                        </Permission>
                                    } )}
                                </DropdownPermissions>
                            </div>
                        )
                    } ) }

               </DropdownListContainer>

                {isCreatingUser && <Popup 
                    settings={ {
                        type: "form",

                        title: "Criar Usuário",
                        buttons: ["Criar"],

                        inputs: [ 
                            {
                                type: "text",
                                text: "Usuario", 
                                value: createUserInfo["user"]
                            }, 
                            {
                                type: "text",
                                text: "Senha",
                                value: createUserInfo["password"]
                            } 
                        ],

                        onInputChanged: handleInputPopup,
                        onButtonPressed: onPopupButtonPress,

                        disableState: setIsCreatingUser,
                        
                     } }>
                </Popup>}

            </div>
            }

        </div>

    )

}

export default Users