# Scripts de diagnostic - Fultang Hospital

Ce dossier contient des scripts utilitaires pour diagnostiquer et résoudre les problèmes liés aux utilisateurs et à l'authentification.

## 📁 Contenu

### `check_users_roles.py`
Script Python pour lister tous les utilisateurs et vérifier leurs rôles.

**Installation** :
```bash
pip install requests
```

**Usage** :
```bash
python check_users_roles.py
```

**Configuration** :
Modifiez les variables suivantes dans le script si nécessaire :
- `ADMIN_USERNAME` : Nom d'utilisateur administrateur
- `ADMIN_PASSWORD` : Mot de passe administrateur
- `BACKEND_URL` : URL du backend (par défaut : http://127.0.0.1:8000/api/)

---

### `check_users_roles.js`
Version JavaScript du script de diagnostic.

**Installation** :
```bash
npm install axios
```

**Usage** :
```bash
node check_users_roles.js
```

**Configuration** :
Les mêmes variables que la version Python peuvent être modifiées.

---

## 🎯 Que font ces scripts ?

1. **Se connectent** au backend en tant qu'administrateur
2. **Récupèrent** la liste de tous les utilisateurs
3. **Analysent** leurs rôles et postes
4. **Identifient** les utilisateurs avec des problèmes :
   - Rôle vide ou manquant
   - Poste manquant pour le personnel
   - Rôle non reconnu

5. **Affichent** un rapport détaillé avec :
   - Liste complète des utilisateurs
   - Statut de chaque utilisateur (✅ OK ou ❌ Problème)
   - Recommandations pour corriger les problèmes

---

## 📊 Exemple de sortie

```
================================================================================
DIAGNOSTIC DES UTILISATEURS - FULTANG HOSPITAL
================================================================================

✅ Connexion admin réussie

✅ Données récupérées depuis: personnel/

📊 Total d'utilisateurs: 5

ID    Username             Role            Poste                Status
--------------------------------------------------------------------------------
1     admin                admin                                ✅
2     john_doe             personnel       infirmier            ✅
3     jane_smith           personnel                            ⚠️  POSTE VIDE
4     bob_johnson                          receptioniste        ❌ ROLE VIDE
5     alice_williams       directeur                            ✅

================================================================================

⚠️  2 utilisateur(s) avec des problèmes de rôle détecté(s):

  - jane_smith (ID: 3)
    Role: 'personnel', Poste: ''
  - bob_johnson (ID: 4)
    Role: '', Poste: 'receptioniste'

💡 ACTIONS RECOMMANDÉES:
  1. Connectez-vous à l'admin Django: http://127.0.0.1:8000/admin/
  2. Assignez les rôles/postes manquants aux utilisateurs listés ci-dessus
  3. Valeurs possibles pour 'poste' (si role='personnel'):
     - receptioniste, infirmier, medecin, caissier, laborantin, pharmacien, comptable
  4. Valeurs possibles pour 'role':
     - admin, directeur, personnel
================================================================================
```

---

## 🔧 Dépannage

### "Impossible de se connecter"
- Vérifiez que le backend est démarré : http://127.0.0.1:8000
- Vérifiez les identifiants admin dans le script
- Vérifiez l'URL du backend

### "Aucun endpoint utilisateur trouvé"
- Le backend n'expose peut-être pas d'endpoint pour lister les utilisateurs
- Utilisez Django Admin ou Django Shell à la place
- Contactez l'administrateur du backend

### "Module not found: requests/axios"
- Installez les dépendances avec `pip install requests` ou `npm install axios`

---

## 📚 Documentation connexe

- **QUICK_FIX_GUIDE.md** : Guide de résolution rapide
- **AUTHENTICATION_ANALYSIS.md** : Analyse complète du système d'authentification

---

**Dernière mise à jour** : 2025-12-29
