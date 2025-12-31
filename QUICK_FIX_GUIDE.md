# 🚨 Guide de résolution rapide - Erreur de rôle manquant

## Problème
Vous voyez ce message lors de la connexion :
```
Connexion réussie mais redirection non configurée pour le rôle:
```

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier le backend est démarré

```bash
# Le backend doit tourner sur http://127.0.0.1:8000
# Si ce n'est pas le cas, démarrez-le
cd [dossier_du_backend]
python manage.py runserver
```

### Étape 2 : Identifier l'utilisateur problématique

**Option A - Script Python (Recommandé)**
```bash
cd "d:\MAGIE\Nouveau dossier\fultang-frontend\scripts"
pip install requests
python check_users_roles.py
```

**Option B - Script JavaScript**
```bash
cd "d:\MAGIE\Nouveau dossier\fultang-frontend\scripts"
npm install axios
node check_users_roles.js
```

**Option C - Django Shell**
```bash
cd [dossier_du_backend]
python manage.py shell
```
Puis :
```python
from your_app.models import Personnel

# Lister tous les utilisateurs et leurs rôles
for user in Personnel.objects.all():
    role = user.role or '❌ VIDE'
    poste = user.poste or '(vide)'
    print(f"{user.username}: role={role}, poste={poste}")
```

### Étape 3 : Corriger les données

**Option A - Django Admin (Interface graphique)**
1. Ouvrez http://127.0.0.1:8000/admin/
2. Connectez-vous avec vos identifiants admin
3. Allez dans la section "Personnel" ou "Users"
4. Pour chaque utilisateur sans rôle :
   - Cliquez sur son nom
   - Dans le champ **"Role"**, choisissez :
     - `admin` pour un administrateur
     - `directeur` pour un directeur
     - `personnel` pour le personnel médical/administratif
   - Si vous avez choisi `personnel`, dans le champ **"Poste"**, choisissez :
     - `receptioniste`, `infirmier`, `medecin`, `caissier`, `laborantin`, `pharmacien`, ou `comptable`
   - Cliquez sur "Enregistrer"

**Option B - Django Shell (Ligne de commande)**
```bash
python manage.py shell
```
```python
from your_app.models import Personnel

# Exemple : Corriger un utilisateur spécifique
user = Personnel.objects.get(username='nom_utilisateur')
user.role = 'personnel'
user.poste = 'infirmier'  # ou tout autre poste valide
user.save()
print(f"✅ {user.username} mis à jour avec succès")
```

## 🎯 Valeurs valides

### Pour le champ "role"
- `admin`
- `directeur`
- `personnel`

### Pour le champ "poste" (si role = personnel)
- `receptioniste`
- `infirmier`
- `medecin`
- `caissier`
- `laborantin`
- `pharmacien`
- `comptable`

## ✅ Vérification

1. Après correction, essayez de vous reconnecter
2. Vous devriez être redirigé vers le bon tableau de bord
3. Si le problème persiste, vérifiez :
   - Que le rôle est bien en **minuscules**
   - Qu'il n'y a pas d'espaces avant/après
   - Que le backend a bien été redémarré si vous avez modifié le code

## 🆘 Besoin d'aide ?

Consultez le fichier `AUTHENTICATION_ANALYSIS.md` pour une analyse complète du système.

## 📋 Checklist de diagnostic

- [ ] Backend démarré sur http://127.0.0.1:8000
- [ ] Script de diagnostic exécuté
- [ ] Utilisateurs problématiques identifiés
- [ ] Rôles assignés via Django Admin ou Shell
- [ ] Test de connexion effectué
- [ ] Redirection fonctionne correctement

---

**Note** : Les modifications dans `Login.jsx` ont déjà été appliquées. Le système affichera maintenant un message d'erreur clair au lieu d'une alerte popup.
