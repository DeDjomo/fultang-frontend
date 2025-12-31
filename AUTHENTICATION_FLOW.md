# 🔄 Flux d'authentification - Diagramme détaillé

## Vue d'ensemble du processus

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FLUX D'AUTHENTIFICATION FULTANG                     │
└─────────────────────────────────────────────────────────────────────────┘

     👤 UTILISATEUR
        │
        │ Saisit username + password
        ▼
   ┌─────────────────┐
   │   Login.jsx     │
   │  handleLogin()  │
   └────────┬────────┘
            │
            │ Appelle login(data)
            ▼
   ┌─────────────────┐
   │  Provider.jsx   │
   │   login(data)   │
   └────────┬────────┘
            │
            │ POST /api/login/
            │ { username, password }
            ▼
   ┌─────────────────┐
   │  🌐 BACKEND     │
   │  Django API     │
   └────────┬────────┘
            │
            │ Validation réussie
            │ Retourne:
            │ - access token
            │ - refresh token
            │ - user data { role, poste, ... }
            ▼
   ┌─────────────────────────────┐
   │     Provider.jsx            │
   │  Calcul effectiveRole       │
   │                             │
   │  effectiveRole =            │
   │    user.role === 'personnel'│
   │      ? user.poste           │
   │      : user.role            │
   └──────────┬──────────────────┘
              │
              │ Retourne { success, role: effectiveRole, ... }
              ▼
   ┌──────────────────────┐
   │     Login.jsx        │
   │  navigateToRole()    │
   └──────────┬───────────┘
              │
              ▼
        ╔═══════════════════════╗
        ║ effectiveRole existe? ║
        ║  (!null && !empty)    ║
        ╚═══════════╦═══════════╝
                    │
         ┌──────────┴──────────┐
         │ NON                 │ OUI
         ▼                     ▼
    ┌─────────────┐      ╔═══════════════╗
    │ ❌ ERREUR   │      ║ Switch(role)  ║
    │             │      ╚═══════╦═══════╝
    │ "Votre      │              │
    │ compte n'a  │              │
    │ pas de rôle"│              │
    └─────────────┘              │
                                 ▼
         ┌───────────────────────────────────────────────┐
         │                                               │
    ┌────▼────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
    │  admin  │ │directeur │ │personnel │ │ unknown  │ │
    └────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘ │
         │            │            │            │       │
         ▼            ▼            ▼            ▼       │
    ┌─────────┐  ┌─────────┐  ╔══════════╗  ┌─────────────┐
    │ /admin  │  │ /admin  │  ║ Sous-cas ║  │ ❌ ERREUR   │
    └─────────┘  └─────────┘  ╚════╦═════╝  │             │
                                    │        │ "Le rôle X  │
                                    ▼        │ n'est pas   │
                 ┌──────────────────────────┐│ reconnu"    │
                 │ receptioniste → /recep...││             │
                 │ infirmier → /nurse       │└─────────────┘
                 │ medecin → /doctor        │
                 │ caissier → /cashier      │
                 │ laborantin → /lab...     │
                 │ pharmacien → /pharmacy   │
                 │ comptable → /accountant  │
                 └──────────┬───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ ✅ REDIRECTION│
                    │  Tableau de   │
                    │     bord      │
                    └───────────────┘
```

---

## 🎯 Points de décision critiques

### 1️⃣ Calcul du rôle effectif (Provider.jsx, ligne 53)

```javascript
const effectiveRole = user.role === 'personnel' ? user.poste : user.role;
```

**Scénarios** :

| user.role    | user.poste   | effectiveRole | Résultat                    |
|--------------|--------------|---------------|-----------------------------|
| `'admin'`    | (ignoré)     | `'admin'`     | ✅ → `/admin`               |
| `'directeur'`| (ignoré)     | `'directeur'` | ✅ → `/admin`               |
| `'personnel'`| `'infirmier'`| `'infirmier'` | ✅ → `/nurse`               |
| `'personnel'`| `null`       | `null`        | ❌ Erreur "rôle vide"       |
| `'personnel'`| `''`         | `''`          | ❌ Erreur "rôle vide"       |
| `null`       | (ignoré)     | `null`        | ❌ Erreur "rôle vide"       |
| `''`         | (ignoré)     | `''`          | ❌ Erreur "rôle vide"       |
| `'xyz'`      | (ignoré)     | `'xyz'`       | ⚠️  Erreur "rôle inconnu"   |

---

### 2️⃣ Validation du rôle (Login.jsx, lignes 75-80)

```javascript
if (!role || role.trim() === '') {
    console.error('Rôle manquant ou vide pour cet utilisateur');
    setIsLoginErrorPresent(true);
    setLoginError("Votre compte n'a pas de rôle assigné. Veuillez contacter l'administrateur.");
    return;
}
```

**Cette validation intercepte** :
- `role = null`
- `role = undefined`
- `role = ''`
- `role = '   '` (espaces uniquement)

---

### 3️⃣ Switch de redirection (Login.jsx, lignes 82-112)

```javascript
switch (role) {
    case 'admin':
        navigate(appRouterPaths.adminHomePage);
        break;
    // ... autres cas ...
    default:
        console.warn('Rôle non reconnu:', role);
        setIsLoginErrorPresent(true);
        setLoginError(`Le rôle "${role}" n'est pas reconnu...`);
}
```

**Ce switch gère** :
- Tous les rôles valides connus
- Cas par défaut pour les rôles inconnus

---

## 🔍 Cas d'erreur détaillés

### Erreur 1 : Rôle vide

**Déclencheur** :
```json
{
  "user": {
    "username": "john_doe",
    "role": null,
    "poste": "infirmier"
  }
}
```

**Flux** :
1. `effectiveRole = null === 'personnel' ? 'infirmier' : null` → `null`
2. Validation détecte `!null` → `true`
3. Affiche : "Votre compte n'a pas de rôle assigné"
4. ❌ Connexion bloquée

---

### Erreur 2 : Poste vide pour personnel

**Déclencheur** :
```json
{
  "user": {
    "username": "jane_smith",
    "role": "personnel",
    "poste": ""
  }
}
```

**Flux** :
1. `effectiveRole = 'personnel' === 'personnel' ? '' : 'personnel'` → `''`
2. Validation détecte `''.trim() === ''` → `true`
3. Affiche : "Votre compte n'a pas de rôle assigné"
4. ❌ Connexion bloquée

---

### Erreur 3 : Rôle inconnu

**Déclencheur** :
```json
{
  "user": {
    "username": "bob_johnson",
    "role": "super_user",
    "poste": null
  }
}
```

**Flux** :
1. `effectiveRole = 'super_user' === 'personnel' ? null : 'super_user'` → `'super_user'`
2. Validation passe (rôle non vide)
3. Switch ne trouve pas de case pour 'super_user'
4. Tombe dans `default`
5. Affiche : "Le rôle 'super_user' n'est pas reconnu"
6. ❌ Connexion bloquée

---

## 📊 Table de routage complète

| effectiveRole  | Route destination              | Composant             |
|----------------|--------------------------------|-----------------------|
| `admin`        | `/admin`                       | AdminDashboard        |
| `directeur`    | `/admin`                       | AdminDashboard        |
| `receptioniste`| `/receptionist`                | ReceptionistDashboard |
| `infirmier`    | `/nurse`                       | NurseDashboard        |
| `medecin`      | `/doctor`                      | DoctorDashboard       |
| `caissier`     | `/cashier`                     | CashierDashboard      |
| `laborantin`   | `/laboratory-assistant`        | LaboratoryDashboard   |
| `pharmacien`   | `/pharmacy`                    | PharmacyDashboard     |
| `comptable`    | `/accountant`                  | AccountantDashboard   |
| `null/empty`   | ❌ Erreur                      | Message d'erreur      |
| `autre`        | ⚠️  Erreur                     | Message d'erreur      |

---

## 🛡️ Protections mises en place

### ✅ Avant la connexion
- Validation des champs username/password dans le formulaire

### ✅ Pendant l'authentification
- Gestion des erreurs réseau (backend inaccessible)
- Gestion des erreurs serveur (401, 403, 500, etc.)

### ✅ Après l'authentification (NOUVEAU)
- ✅ Vérification que le rôle n'est pas vide/null
- ✅ Vérification que le rôle est reconnu
- ✅ Messages d'erreur clairs dans l'UI
- ✅ Pas de redirection si erreur

### ✅ Stockage sécurisé
- Tokens stockés dans localStorage
- Données utilisateur persistées
- Nettoyage automatique en cas d'incohérence

---

## 🔄 Cycle de vie d'une session

```
1. LOGIN
   ↓
2. AUTHENTICATION
   ↓
3. ROLE VALIDATION ← NOUVEAU
   ↓
4. NAVIGATION
   ↓
5. SESSION ACTIVE
   ↓
6. LOGOUT
   ↓
7. CLEANUP (tokens, localStorage)
```

---

## 📝 Notes importantes

1. **Sensibilité à la casse** : Tous les rôles sont convertis en minuscules
2. **Espaces** : Trimés automatiquement lors de la validation
3. **Priorité** : Si `role = 'personnel'`, `poste` prend la priorité
4. **Fallback** : Admin et Directeur partagent la même route
5. **Validation** : Double validation (vide + inconnu)

---

**Date de création** : 2025-12-29  
**Version** : 1.0  
**Fichiers liés** :
- `src/Utils/Provider.jsx`
- `src/Pages/Authentication/Login.jsx`
- `AUTHENTICATION_ANALYSIS.md`
