import Cookies from "js-cookie";

// Função de autenticação geral
export const Authenticate = async (router, notificationManager) => {

    // Autenticação
    const response = await fetch("/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: Cookies.get("flashback_auth") }),
    });

    const data = await response.json();

    // Verifica se o token é válido
    if (response.status !== 200) {
      notificationManager.addNotification({
        type: "error",
        message: "Sua sessão expirou, faça login novamente.",
        duration: 3000,
      });

      Cookies.remove("flashback_auth");
      Cookies.remove("permissions");
      router.push("/");

      return false;
    }
    
    // Atualiza as permissões
    Cookies.set("permissions", data.permissions);

    return true; 
};

// Função de checagem de permissão
export const hasPermission = (permission) => {
  let Permissions = Cookies.get("permissions");
  if (!Permissions) {
    Cookies.remove("permissions");
    Cookies.remove("flashback_auth");
    return false;
  }

  Permissions = Permissions.split(",");

  return Permissions.includes(permission);
};
