'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useNotification } from "@/frontend/context/NotificationContext";
import styles from './page.module.css'; // Import CSS Module

import { Authenticate } from "@/frontend/autenticacao/autenticacao";

import Cookies from 'js-cookie';

const isLoggedIn = async(router) => {
    if ( Cookies.get("flashback_auth") && Authenticate( Cookies.get("flashback_auth") )) {
        router.push("/hub")
    }
}

export default function HomePage() {
    const router = useRouter();
    const { notificationManager } = useNotification();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect( () => {
      isLoggedIn(router)
    }, [])

    const handleLogin = async () => {

        if (isProcessing) {
            return;
        }

        setIsProcessing(true)

        notificationManager.addNotification({
            message: "Realizando login...",
            type: "info",
        });

        const response = await fetch('/v1/login', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, password: password }),
        });

        const data = await response.json();
        const TranslateResponse = {
            200: "success",
            401: "error",
        };

        const TranslatedType = TranslateResponse[response.status] || "info";

        notificationManager.addNotification({
            message: data.message,
            type: TranslatedType,
        });

        if (response.status === 200) {
          Cookies.set("flashback_auth", data.token, { expires: 1, path: '/', secure: false, sameSite: 'Lax' })
          Cookies.set("username", data.username)
          Cookies.set("permissions", data.permissions)
          setTimeout(() => {
            router.push('/hub')
            setIsProcessing(false)
          }, 500);
        } else {
            setIsProcessing(false)
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.loginForm} onSubmit={(e) => e.preventDefault()}>
                <h2 className={styles.title}>Login</h2>
                <div className={styles.inputGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        placeholder="Usuário"
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        placeholder="Senha"
                        required
                    />
                </div>
                <button type="submit" onClick={handleLogin} className={`${styles.button} ${ isProcessing && styles.button_disabled }`}>
                    Login
                </button>
            </form>
        </div>
    );
}
