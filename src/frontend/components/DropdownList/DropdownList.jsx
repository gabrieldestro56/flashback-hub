'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DropdownList.module.css'

import Cookies from 'js-cookie';

import { Tooltip } from '@mui/material';

export const DropdownListContainer = ({children}) => {
    return (
        <div className={styles.vertical_container}>
            {children}
        </div>
    )
}

export const DropdownItem = ({ title, onClick, onDelete, StateControl, name, isRoot }) => {
    return (
        <div className={styles.user}>
            <img onClick={onClick} name={name} src="/svg/dropdown_arrow.svg" alt="" className={`${styles.icon} ${styles.arrow} ${StateControl[name] && styles.arrow_clicked} `} />
            <span className={styles.title}>{title}</span>
            <svg onClick={() => onDelete(name)} className={`${styles.icon} ${isRoot ? styles.trashcan_nopointer : styles.trashcan}`} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </div>
    )
}

export const Permission = ({ permission, title, tooltip, user, isOn, onToggle }) => {
    return (

        <div 
        
        // Lógica de proteção de permissão
        // Não permite que um usuário alterne seu estado root ou remova seu próprio administrador.
        className={`${styles.checkbox_container} 
        ${ (permission === "root" 
        || (permission === "admin" && user === Cookies.get("username")))
         && styles.disabled_permission }`}>

            <div onClick={ () => onToggle(user, permission) } 

            // Lógica de proteção de permissão
            // Não permite que um usuário alterne seu estado root ou remova seu próprio administrador.
            className={`${(permission === "root" 
            || (permission === "admin" && user === Cookies.get("username"))) 
            ? styles.checkbox_nopointer 
            : styles.checkbox}`}>

                {
                    isOn &&
                    <svg className={styles.checkbox_on} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                    ||  <svg className={`${styles.checkbox_off}`} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                }
            </div>

            <span className={styles.permission_title}>{title}</span>

            <Tooltip className={styles.tooltip} title={tooltip}>
                <img src='/svg/help.svg' className={styles.tooltip}></img>
            </Tooltip>

        </div>
    )
}

export const DropdownPermissions = ({ children, StateControl, name }) => {
    return (
        <div className={`${styles.dropdown} ${StateControl[name] && styles.dropdown_open}`}>       
            {children}
        </div>
    )
}