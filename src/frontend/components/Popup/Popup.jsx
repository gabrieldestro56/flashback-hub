'use client'

import { popoverClasses } from '@mui/material'
import styles from './Popup.module.css'

const Form = ({elements, onInputChanged}) => {
    return (
        <div className={styles.formContainer}>
            {elements.map( ( (element, index) => {
                return <input
                    key={index}
                    name={element.text}
                    className={styles.input} 
                    placeholder={element.text} 
                    type={element.type}
                    onInput={onInputChanged}
                    value={element.value}
                />
            } ) )}
        </div>
    )
}

const ButtonContainer = ({elements, onButtonPressed}) => {
    return (
        <div className={styles.buttonContainer}>
            { elements.map( (button, index) => {
                return (
                <div
                    key={index}
                    name={button}
                    className={styles.button}
                    onClick={() => onButtonPressed(button)}
                    > 
                {button}
                </div>
            )
            } ) }
        </div>
    )
}

export const Popup = ({ children, settings }) => {
    return (
        <div>

            <div className={styles.blackout}/>

            <div className={styles.popup}>

                <div className={styles.popupHeader}>
                    <span className={styles.title}>{settings.title}</span>
                    <img src='/svg/close.svg' className={styles.icon} onClick={ () => settings.disableState(false) }></img>
                </div>

                <div className={styles.popupContentContainer}>
                    { settings.type === "form" && 
                        <Form elements={settings.inputs} onInputChanged={settings.onInputChanged}></Form>
                    }

                    { settings.type === "text" &&
                        <span>{settings.text}</span>
                    }
                </div>

                <ButtonContainer elements={settings.buttons} onButtonPressed={settings.onButtonPressed}/>
                
            </div>

        </div>
    )

}
