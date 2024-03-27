'use client'

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import styles from './page.module.css'
import Alert from '@mui/material/Alert';

export default function Cadastro() {

    const router = useRouter()

    const handleVoltar = () => {
      router.push('/')
    }

    return (
      
      <div className={styles.mainContainer}>

        <span className={styles.title}>Sucesso!</span>
        <span className={styles.subtitle}>Seus dados foram enviados e estão sendo analisados para autorizar o acesso à plataforma.</span>
        <button onClick={handleVoltar} className={styles.button}>VOLTAR</button>
        
      </div>
    );

}