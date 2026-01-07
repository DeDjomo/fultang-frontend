# 🔧 Templates de correction - Rôles utilisateurs

## 📋 Table des matières
1. [Django Shell](#django-shell)
2. [SQL Direct](#sql-direct)
3. [Script de migration Django](#script-de-migration-django)
4. [Commandes utiles](#commandes-utiles)

---

## 1️⃣ Django Shell

### Ouvrir le shell Django
```bash
python manage.py shell
```

### a) Lister tous les utilisateurs avec leurs rôles
```python
from your_app.models import Personnel  # Remplacer 'your_app'

print(f"{'ID':<5} {'Username':<20} {'Role':<15} {'Poste':<20}")
print("-" * 65)
for user in Personnel.objects.all():
    role = user.role or '(vide)'
    poste = user.poste or '(vide)'
    print(f"{user.id:<5} {user.username:<20} {role:<15} {poste:<20}")
```

### b) Trouver les utilisateurs sans rôle
```python
from your_app.models import Personnel
from django.db.models import Q

# Utilisateurs avec role vide ou null
users_no_role = Personnel.objects.filter(Q(role__isnull=True) | Q(role=''))
print(f"Utilisateurs sans rôle: {users_no_role.count()}")
for user in users_no_role:
    print(f"  - {user.username} (ID: {user.id})")

# Personnel sans poste
personnel_no_poste = Personnel.objects.filter(role='personnel', poste__in=['', None])
print(f"\nPersonnel sans poste: {personnel_no_poste.count()}")
for user in personnel_no_poste:
    print(f"  - {user.username} (ID: {user.id})")
```

### c) Corriger un utilisateur spécifique
```python
from your_app.models import Personnel

# Méthode 1: Par username
user = Personnel.objects.get(username='nom_utilisateur')
user.role = 'personnel'
user.poste = 'infirmier'
user.save()
print(f"✅ {user.username} mis à jour")

# Méthode 2: Par ID
user = Personnel.objects.get(id=5)
user.role = 'admin'
user.save()
print(f"✅ Utilisateur ID {user.id} ({user.username}) mis à jour")
```

### d) Corriger plusieurs utilisateurs en masse

**Exemple 1 : Assigner "admin" à tous les users sans rôle**
```python
from your_app.models import Personnel
from django.db.models import Q

users_to_update = Personnel.objects.filter(Q(role__isnull=True) | Q(role=''))
count = users_to_update.update(role='admin')
print(f"✅ {count} utilisateur(s) mis à jour avec role='admin'")
```

**Exemple 2 : Assigner un poste par défaut au personnel sans poste**
```python
from your_app.models import Personnel

personnel_to_update = Personnel.objects.filter(role='personnel', poste__in=['', None])
count = personnel_to_update.update(poste='receptioniste')
print(f"✅ {count} personnel(s) mis à jour avec poste='receptioniste'")
```

**Exemple 3 : Corriger selon des critères personnalisés**
```python
from your_app.models import Personnel

# Tous les users dont le username commence par 'inf_' → infirmier
Personnel.objects.filter(username__startswith='inf_').update(
    role='personnel',
    poste='infirmier'
)

# Tous les users dont le username commence par 'doc_' → medecin
Personnel.objects.filter(username__startswith='doc_').update(
    role='personnel',
    poste='medecin'
)
```

---

## 2️⃣ SQL Direct

⚠️ **Attention** : Faites un backup avant toute modification SQL directe !

### a) Backup de la table
```bash
# PostgreSQL
pg_dump -U username -d database_name -t personnel_table > backup_personnel.sql

# MySQL
mysqldump -u username -p database_name personnel_table > backup_personnel.sql

# SQLite
sqlite3 database.db ".dump personnel_table" > backup_personnel.sql
```

### b) Requêtes SELECT (consultation)

**Lister tous les utilisateurs**
```sql
SELECT id, username, role, poste FROM personnel_table;
```

**Trouver les utilisateurs sans rôle**
```sql
SELECT id, username, role, poste 
FROM personnel_table 
WHERE role IS NULL OR role = '';
```

**Trouver le personnel sans poste**
```sql
SELECT id, username, role, poste 
FROM personnel_table 
WHERE role = 'personnel' AND (poste IS NULL OR poste = '');
```

**Compter les utilisateurs par rôle**
```sql
SELECT role, COUNT(*) as count 
FROM personnel_table 
GROUP BY role;
```

**Compter le personnel par poste**
```sql
SELECT poste, COUNT(*) as count 
FROM personnel_table 
WHERE role = 'personnel' 
GROUP BY poste;
```

### c) Requêtes UPDATE (modification)

**Assigner un rôle à un utilisateur spécifique**
```sql
UPDATE personnel_table 
SET role = 'admin' 
WHERE username = 'nom_utilisateur';
```

**Assigner un poste à un personnel spécifique**
```sql
UPDATE personnel_table 
SET role = 'personnel', poste = 'infirmier' 
WHERE username = 'nom_utilisateur';
```

**Corriger tous les utilisateurs sans rôle**
```sql
UPDATE personnel_table 
SET role = 'admin' 
WHERE role IS NULL OR role = '';
```

**Corriger tout le personnel sans poste**
```sql
UPDATE personnel_table 
SET poste = 'receptioniste' 
WHERE role = 'personnel' AND (poste IS NULL OR poste = '');
```

### d) Vérification après modification
```sql
-- Vérifier qu'aucun utilisateur n'a de rôle vide
SELECT COUNT(*) as users_no_role 
FROM personnel_table 
WHERE role IS NULL OR role = '';

-- Vérifier qu'aucun personnel n'a de poste vide
SELECT COUNT(*) as personnel_no_poste 
FROM personnel_table 
WHERE role = 'personnel' AND (poste IS NULL OR poste = '');

-- Ces deux requêtes doivent retourner 0
```

---

## 3️⃣ Script de migration Django

Créez un fichier de migration personnalisé pour corriger les données.

### a) Créer la migration
```bash
python manage.py makemigrations --empty --name fix_empty_roles your_app
```

### b) Éditer le fichier de migration

**Fichier** : `your_app/migrations/XXXX_fix_empty_roles.py`

```python
from django.db import migrations

def fix_empty_roles(apps, schema_editor):
    """
    Corrige tous les utilisateurs sans rôle ou poste assigné
    """
    Personnel = apps.get_model('your_app', 'Personnel')
    
    # Compter les problèmes
    no_role_count = Personnel.objects.filter(role__in=['', None]).count()
    no_poste_count = Personnel.objects.filter(
        role='personnel', poste__in=['', None]
    ).count()
    
    print(f"Trouvé {no_role_count} utilisateur(s) sans rôle")
    print(f"Trouvé {no_poste_count} personnel(s) sans poste")
    
    # Option 1: Assigner un rôle par défaut
    Personnel.objects.filter(role__in=['', None]).update(role='personnel', poste='receptioniste')
    
    # Option 2: Assigner un poste par défaut au personnel
    Personnel.objects.filter(role='personnel', poste__in=['', None]).update(poste='receptioniste')
    
    print("✅ Correction terminée")

def reverse_fix(apps, schema_editor):
    """
    Fonction de rollback (optionnelle)
    """
    print("⚠️  Attention: Pas de rollback pour cette migration")
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('your_app', 'PREVIOUS_MIGRATION_NAME'),  # Remplacer
    ]

    operations = [
        migrations.RunPython(fix_empty_roles, reverse_fix),
    ]
```

### c) Exécuter la migration
```bash
python manage.py migrate
```

---

## 4️⃣ Commandes utiles

### Django Management Command personnalisée

Créez un fichier : `your_app/management/commands/fix_user_roles.py`

```python
from django.core.management.base import BaseCommand
from your_app.models import Personnel
from django.db.models import Q

class Command(BaseCommand):
    help = 'Corrige les utilisateurs sans rôle ou poste'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche les changements sans les appliquer',
        )
        parser.add_argument(
            '--default-role',
            type=str,
            default='personnel',
            help='Rôle par défaut à assigner',
        )
        parser.add_argument(
            '--default-poste',
            type=str,
            default='receptioniste',
            help='Poste par défaut à assigner',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        default_role = options['default_role']
        default_poste = options['default_poste']
        
        # Trouver les utilisateurs problématiques
        users_no_role = Personnel.objects.filter(Q(role__isnull=True) | Q(role=''))
        personnel_no_poste = Personnel.objects.filter(
            role='personnel', 
            poste__in=['', None]
        )
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"DIAGNOSTIC DES UTILISATEURS")
        self.stdout.write(f"{'='*60}\n")
        
        # Rapport
        self.stdout.write(f"Utilisateurs sans rôle: {users_no_role.count()}")
        for user in users_no_role:
            self.stdout.write(f"  - {user.username} (ID: {user.id})")
        
        self.stdout.write(f"\nPersonnel sans poste: {personnel_no_poste.count()}")
        for user in personnel_no_poste:
            self.stdout.write(f"  - {user.username} (ID: {user.id})")
        
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"\n⚠️  DRY RUN - Aucune modification appliquée"
            ))
            self.stdout.write(f"Seraient assignés:")
            self.stdout.write(f"  - Role: '{default_role}'")
            self.stdout.write(f"  - Poste: '{default_poste}'")
        else:
            # Appliquer les corrections
            count1 = users_no_role.update(role=default_role, poste=default_poste)
            count2 = personnel_no_poste.update(poste=default_poste)
            
            self.stdout.write(self.style.SUCCESS(
                f"\n✅ {count1} utilisateur(s) mis à jour avec role + poste"
            ))
            self.stdout.write(self.style.SUCCESS(
                f"✅ {count2} personnel(s) mis à jour avec poste"
            ))
        
        self.stdout.write(f"\n{'='*60}\n")
```

**Usage** :
```bash
# Dry run (simulation)
python manage.py fix_user_roles --dry-run

# Application réelle
python manage.py fix_user_roles

# Avec des valeurs personnalisées
python manage.py fix_user_roles --default-role=admin --default-poste=medecin
```

---

## 📋 Checklist de correction

Avant de corriger :
- [ ] Backup de la base de données effectué
- [ ] Identification des utilisateurs problématiques
- [ ] Décision sur les valeurs par défaut à assigner

Correction :
- [ ] Méthode choisie (Django Shell / SQL / Migration / Command)
- [ ] Corrections appliquées
- [ ] Vérification que count = 0 pour les problèmes

Après correction :
- [ ] Test de connexion avec les utilisateurs corrigés
- [ ] Vérification des redirections
- [ ] Documentation des changements

---

## 🎯 Valeurs recommandées

### Rôles valides
- `admin` - Administrateur système
- `directeur` - Directeur
- `personnel` - Personnel (nécessite un poste)

### Postes valides (si role = 'personnel')
- `receptioniste`
- `infirmier`
- `medecin`
- `caissier`
- `laborantin`
- `pharmacien`
- `comptable`

---

**Date de création** : 2025-12-29  
**Version** : 1.0
