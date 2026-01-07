# Configuration de l'Authentification

## Rôles à Ajouter

Pour que les pages migrées fonctionnent correctement, assurez-vous que le système d'authentification reconnaît les rôles suivants:

### Rôles Requis

1. **"Accountant"** - Pour ComptaMatiere (Comptable Matière)
2. **"Director"** - Pour Director (Directeur)
3. **"Pharmacist"** - Pour Pharmacist (Pharmacien)

## Configuration du Login

### Fichier: `src/Pages/Authentication/Login.jsx`

Ajoutez ou vérifiez la logique de redirection après login:

```javascript
// Exemple de redirection basée sur le rôle
const handleLoginSuccess = (userData) => {
  switch(userData.role) {
    case "Accountant":
      navigate("/compta-matiere/dashboard");
      break;
    case "Director":
      navigate("/director/dashboard");
      break;
    case "Pharmacist":
      navigate("/pharmacist/dashboard");
      break;
    case "FinancialAccountant":
      navigate("/accountant-financial/home");
      break;
    // ... autres rôles
    default:
      navigate("/");
  }
};
```

## Configuration du Provider

### Fichier: `src/Utils/Provider.jsx`

Vérifiez que la fonction `hasRole()` est correctement implémentée:

```javascript
export function useAuthentication() {
  // ...
  
  const hasRole = (requiredRole) => {
    if (!userData || !userData.role) return false;
    return userData.role === requiredRole;
  };
  
  return {
    isAuthenticated,
    hasRole,
    userData,
    login,
    logout
  };
}
```

## Comptes de Test Suggérés

### Comptable Matière
```javascript
{
  username: "comptable.matiere",
  password: "test123",
  role: "Accountant",
  fullName: "Jean-Paul Dupont"
}
```

### Directeur
```javascript
{
  username: "directeur",
  password: "test123",
  role: "Director",
  fullName: "Dr. Kamdem Jean"
}
```

### Pharmacien
```javascript
{
  username: "pharmacien",
  password: "test123",
  role: "Pharmacist",
  fullName: "Mme. Tchuente Claire"
}
```

## Vérification des Rôles

Chaque page vérifie le rôle à l'aide du composant Dashboard:

```javascript
// ComptaMatiere
<ComptaMatiereDashBoard
  linkList={ComptaMatiereNavLink}
  requiredRole={"Accountant"}  // ← Vérifie ce rôle
>
  {/* ... */}
</ComptaMatiereDashBoard>

// Director
<DirectorDashBoard
  linkList={DirectorNavLink}
  requiredRole={"Director"}  // ← Vérifie ce rôle
>
  {/* ... */}
</DirectorDashBoard>

// Pharmacist
<PharmacistDashBoard
  linkList={PharmacistNavLink}
  requiredRole={"Pharmacist"}  // ← Vérifie ce rôle
>
  {/* ... */}
</PharmacistDashBoard>
```

## Redirection si Non Autorisé

Si un utilisateur n'a pas le bon rôle, il sera redirigé vers la page `AccessDenied`:

```javascript
// Dans chaque Dashboard component
if (!hasRole(requiredRole)) {
  return <AccessDenied Role={requiredRole} />;
}
```

## Menu Principal / Landing Page

Ajoutez des liens vers les nouveaux dashboards dans votre menu principal:

```javascript
// Exemple pour LandingPage.jsx ou Menu.jsx
const menuLinks = [
  // ... autres liens
  {
    role: "Accountant",
    link: "/compta-matiere/dashboard",
    label: "Comptable Matière",
    icon: <FaBoxes />
  },
  {
    role: "Director",
    link: "/director/dashboard",
    label: "Directeur",
    icon: <FaUserTie />
  },
  {
    role: "Pharmacist",
    link: "/pharmacist/dashboard",
    label: "Pharmacien",
    icon: <FaPills />
  }
];
```

## Protection des Routes

Toutes les routes sont déjà protégées via les composants Dashboard qui vérifient:
1. **Authentification** - L'utilisateur est-il connecté ?
2. **Autorisation** - L'utilisateur a-t-il le bon rôle ?

Si l'une de ces conditions n'est pas remplie:
- Non authentifié → Redirection vers `/login`
- Mauvais rôle → Affichage de `AccessDenied`

## Notes Importantes

- ⚠️ **Les rôles sont case-sensitive** : "Accountant" ≠ "accountant"
- ⚠️ **Vérifiez la cohérence** des noms de rôles entre le backend et le frontend
- ⚠️ **Testez chaque rôle** pour vous assurer que les restrictions fonctionnent

## Checklist de Vérification

- [ ] Les rôles "Accountant", "Director", "Pharmacist" sont reconnus par le système
- [ ] La fonction `hasRole()` fonctionne correctement
- [ ] La redirection après login est configurée
- [ ] Des comptes de test existent pour chaque rôle
- [ ] La page AccessDenied s'affiche si le rôle est incorrect
- [ ] La redirection vers /login fonctionne si non authentifié
