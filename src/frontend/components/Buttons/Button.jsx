'use client'

import styles from './Buttons.module.css'

export const ButtonContainer = ({ children }) => {

    return (
        <div className={styles.vertical_flex}>
            {children}
        </div>
    )

}

export const Button = ({icon, title, onClick, isDisabled}) => {

    return (
        <div className={`${ isDisabled ? styles.disabled_button : styles.button}`} onClick={onClick}>
            <img className={styles.icon} src={`/svg/${icon}.svg`} alt={icon}></img>
            <label className={styles.text}>{title}</label>
        </div>
    )
}


