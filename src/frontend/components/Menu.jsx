'use client';

import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import styles from './Menu.module.css';

import { Home } from '@mui/icons-material'
import { Tooltip } from '@mui/material';

export const Menu = ({ children }) => {
    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}

export const MenuItem = ({ name, icon, onClick }) => {
    return (
        <div className={styles.item} onClick={onClick}>
            <img src={`/svg/${icon}.svg`} alt={icon} className={styles.icon}></img>
            <label className={styles.title}>{name}</label>
        </div>
    )
}


