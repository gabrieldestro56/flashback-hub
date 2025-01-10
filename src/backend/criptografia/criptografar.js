// Criptografia para senhas
import { sha256 } from "js-sha256"
const salt = process.env.SALT

export const encryptPassword = (password) => {
    return sha256(password + salt)
}

export const passwordMatch = ( password, passwordDB ) => {
    return sha256(password + salt) === passwordDB
}

