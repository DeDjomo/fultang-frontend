import constate from "constate";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export const [FultangProvider, useAuthentication] = constate(
  useLogin,
  (value) => value.authMethods
);

function useLogin() {
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [userRole, setUserRole] = useState("");

  function saveAuthParameters(token, refreshToken) {
    localStorage.setItem("token_key_fultang", token);
    localStorage.setItem("refresh_token_fultang", refreshToken);
  }

  function saveUserData(user, effectiveRole) {
    localStorage.setItem("user_data_fultang", JSON.stringify(user));
    localStorage.setItem("user_role_fultang", effectiveRole);
    // Stocker personnel_id et user_name pour les composants qui en ont besoin
    if (user.idpersonnel || user.id) {
      localStorage.setItem("personnel_id", String(user.idpersonnel || user.id));
    }
    if (user.nom || user.prenom) {
      localStorage.setItem("user_name", `${user.nom || ''} ${user.prenom || ''}`.trim());
    }
  }

  function clearLocalStorage() {
    localStorage.removeItem("token_key_fultang");
    localStorage.removeItem("refresh_token_fultang");
    localStorage.removeItem("user_data_fultang");
    localStorage.removeItem("user_role_fultang");
    // Nettoyer également personnel_id et user_name
    localStorage.removeItem("personnel_id");
    localStorage.removeItem("user_name");
  }

  async function login(data) {
    try {
      const baseURL = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api";
      console.log('=== TENTATIVE DE CONNEXION ===');
      console.log('URL Backend:', baseURL);
      console.log('Données envoyées:', { username: data.username, password: '***' });

      const response = await axios.post(
        `${baseURL}/login/`,
        data
      );

      console.log('=== RÉPONSE DU BACKEND ===');
      console.log('Status:', response.status);
      console.log('Réponse complète:', response.data);

      if (response.status === 200 && response.data.success) {
        setIsLoading(false);
        console.log("logged user data: ", response);

        // IMPORTANT: Nettoyer les anciennes données avant de sauvegarder les nouvelles
        clearLocalStorage();

        // Sauvegarder les tokens
        saveAuthParameters(response.data.data.access, response.data.data.refresh);

        // Sauvegarder les données utilisateur
        const user = response.data.data.user;
        setUserData(user);

        console.log('=== DÉTERMINATION DU RÔLE ===');
        console.log('user.role:', user.role);
        console.log('user.poste:', user.poste);

        // Pour le personnel, utiliser le poste au lieu du role pour la redirection
        const effectiveRole = user.role === 'personnel' ? user.poste : user.role;

        console.log('Rôle effectif déterminé:', effectiveRole);

        // Stocker le role effectif (poste pour personnel, role pour admin)
        setUserRole(effectiveRole);
        setIsLogged(true);

        // Sauvegarder dans localStorage pour persistence
        saveUserData(user, effectiveRole);

        console.log('=== CONNEXION RÉUSSIE ===');
        console.log('Retour au frontend:', {
          success: true,
          role: effectiveRole,
          message: response.data.message,
          first_login_done: user.first_login_done
        });

        return {
          success: true,
          role: effectiveRole,  // Retourne poste si personnel, role sinon
          message: response.data.message,
          first_login_done: user.first_login_done  // Pour la premiere connexion
        };
      }
    } catch (error) {
      setIsLoading(false);
      console.error("=== ERREUR D'AUTHENTIFICATION ===");
      console.error("Error object:", error);

      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        console.error('Réponse erreur du serveur:', error.response.data);
        console.error('Status:', error.response.status);
        return {
          success: false,
          status: error.response.status,
          error: error.response.data.error || "Erreur d'authentification",
          detail: error.response.data.detail || "Une erreur s'est produite"
        };
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('Pas de réponse du serveur');
        console.error('Request:', error.request);
        return {
          success: false,
          error: "Erreur de connexion",
          detail: "Impossible de contacter le serveur. Vérifiez que le backend est démarré."
        };
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
        return {
          success: false,
          error: "Erreur",
          detail: error.message
        };
      }
    }
  }

  async function getCurrentUserInfos() {
    const token = localStorage.getItem("token_key_fultang");
    if (token) {
      try {
        const baseURL = import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api/";
        const response = await axios.get(
          `${baseURL}/me/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          console.log(response.data);
          setIsLogged(true);
          setUserData(response.data);
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.log(error);
        setIsLogged(false);
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token_key_fultang");
    if (token) {
      // Restaurer les données utilisateur depuis localStorage
      const savedUserData = localStorage.getItem("user_data_fultang");
      const savedUserRole = localStorage.getItem("user_role_fultang");

      if (savedUserData && savedUserRole) {
        setUserData(JSON.parse(savedUserData));
        setUserRole(savedUserRole);
        setIsLogged(true);
      } else {
        // Token existe mais pas les données user - nettoyer
        clearLocalStorage();
        setIsLogged(false);
        setUserData({});
        setUserRole("");
      }
    } else {
      setIsLogged(false);
      setUserData({});
      setUserRole("");
      clearLocalStorage();
    }
  }, []);

  // ============================================================
  // PROTECTION TEMPORAIREMENT DÉSACTIVÉE POUR TESTS
  // TODO: Réactiver la protection avant mise en production
  // ============================================================

  function isAuthenticated() {
    // TEMPORAIRE: Toujours authentifié pour les tests
    return true;

    /* ORIGINAL CODE - À RÉACTIVER PLUS TARD:
    return isLogged;
    */
  }

  function hasRole(requiredRole) {
    // TEMPORAIRE: Tous les rôles sont acceptés pour les tests
    return true;

    /* ORIGINAL CODE - À RÉACTIVER PLUS TARD:
    if (isLogged) {
      // Utiliser userRole qui contient le poste effectif (receptioniste, infirmier, etc.)
      if (userRole) {
        // Comparaison insensible à la casse
        return userRole.toLowerCase() === requiredRole.toLowerCase();
      }
      // Fallback: vérifier dans userData
      if (userData.role) {
        const effectiveRole = userData.role === 'personnel' ? userData.poste : userData.role;
        return effectiveRole?.toLowerCase() === requiredRole.toLowerCase();
      }
      return false;
    } else {
      return false;
    }
    */
  }

  function logout() {
    clearLocalStorage();
    setIsLogged(false);
    setUserData({});
    setUserRole("");
    window.location.href = "/login";
  }

  const authMethods = useMemo(
    () => ({
      login,
      setIsLoading,
      isLoading,
      userData,
      isLogged,
      isAuthenticated,
      hasRole,
      userRole,
      logout,
    }),
    [isLoading, userData, isLogged, userRole, logout]
  );
  return { authMethods };
}
