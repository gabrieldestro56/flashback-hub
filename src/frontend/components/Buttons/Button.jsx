'use client'

import styles from './Buttons.module.css'

export const ButtonContainer = ({ children }) => {

    return (
        <div className={styles.vertical_flex}>
            {children}
        </div>
    )

}

export const Button = ({icon, title, onClick}) => {

    return (
        <div className={styles.adicionarButton} onClick={onClick}>
            <img className={styles.icon} src={`/svg/${icon}.svg`} alt={icon}></img>
            <label className={styles.text}>{title}</label>
        </div>
    )
}


