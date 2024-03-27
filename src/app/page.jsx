'use client'

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import styles from './page.module.css'

export default function HomePage() {

    const router = useRouter();

    const TextList = ["ELETRICISTA", "ENCANADOR", "CONFEITEIRO", "VENDEDOR DE EMBALAGEM"]
    const [text, setText] = useState('')

    useEffect( () => {
      setText( TextList[ Math.floor(Math.random() * TextList.length) ] )
    }, [] )

    const handleCadastroClick = () => {
      router.push('/cadastro')
    };

    const handleJaCadastradoClick = () => {
      console.log("Redirecionando para o login...");
    };

    return (
      <div className={styles.mainContainer}>
        <div className={styles.pageContainer}>

          <div className={styles.leftContainer}>
            <div className={`${styles.auxText} ${styles.mainTitleText} `}>POR ACASO</div>
            <div className={ `${styles.mainTitle} ${styles.mainTitleText}` }>ALGUEM CONHECE</div>
            <div className={styles.horizontalForm}>
              <div className={`${styles.auxText} ${styles.mainTitleText}`}>UM</div>
              <div className={`${styles.alternatingText} ${styles.mainTitleText}`}>{text}</div>
            </div>
            
          </div>

          <div className={styles.welcomeContainer}>
            <span className={styles.subtitle}>Escolha uma opção para fazer acesso a plataforma</span>
            <button onClick={handleCadastroClick} className={styles.button}>FAZER CADASTRO</button>
            <button className={styles.button}>FAZER LOGIN</button>
          </div>

        </div>
      </div>
    );
}