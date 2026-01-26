#!/usr/bin/env python3
"""
Script de diagnostic pour vérifier les utilisateurs et leurs rôles
Usage: python check_users_roles.py
"""

import requests
import json
from typing import Dict, List

# Configuration
BACKEND_URL = "http://127.0.0.1:8000/api/"
ADMIN_USERNAME = "admin"  # Remplacer par vos identifiants admin
ADMIN_PASSWORD = "admin"  # Remplacer par vos identifiants admin


def login_as_admin() -> str:
    """Se connecter en tant qu'admin et récupérer le token"""
    try:
        response = requests.post(
            f"{BACKEND_URL}login/",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                token = data["data"]["access"]
                print("✅ Connexion admin réussie\n")
                return token
            else:
                print(f"❌ Échec de connexion: {data}")
                return None
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erreur de connexion au backend: {e}")
        return None


def get_all_users(token: str) -> List[Dict]:
    """Récupérer la liste de tous les utilisateurs"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Essayer différents endpoints possibles
        endpoints = [
            "users/",
            "personnel/",
            "staff/",
            "admin/users/"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers)
                if response.status_code == 200:
                    print(f"✅ Données récupérées depuis: {endpoint}\n")
                    return response.json()
            except:
                continue
        
        print("❌ Aucun endpoint utilisateur trouvé")
        return []
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des utilisateurs: {e}")
        return []


def analyze_users(users: List[Dict]):
    """Analyser et afficher les informations des utilisateurs"""
    print("=" * 80)
    print("ANALYSE DES UTILISATEURS ET LEURS RÔLES")
    print("=" * 80)
    
    if not users:
        print("\n⚠️  Aucun utilisateur trouvé ou données non disponibles")
        print("\n💡 SOLUTION ALTERNATIVE:")
        print("   Connectez-vous directement à la base de données Django:")
        print("   python manage.py shell")
        print("   >>> from your_app.models import Personnel")
        print("   >>> for user in Personnel.objects.all():")
        print("   >>>     print(f'{user.username}: role={user.role}, poste={user.poste}')")
        return
    
    users_with_issues = []
    
    # Si c'est un dictionnaire avec une clé 'results' (pagination Django)
    if isinstance(users, dict):
        users = users.get('results', users.get('data', []))
    
    print(f"\n📊 Total d'utilisateurs: {len(users)}\n")
    print(f"{'ID':<5} {'Username':<20} {'Role':<15} {'Poste':<20} {'Status'}")
    print("-" * 80)
    
    for user in users:
        user_id = user.get('id', 'N/A')
        username = user.get('username', 'N/A')
        role = user.get('role', '')
        poste = user.get('poste', '')
        
        # Calculer le rôle effectif (comme dans le frontend)
        effective_role = poste if role == 'personnel' else role
        
        # Détecter les problèmes
        status = "✅"
        if not role or role.strip() == '':
            status = "❌ ROLE VIDE"
            users_with_issues.append(user)
        elif role == 'personnel' and (not poste or poste.strip() == ''):
            status = "⚠️  POSTE VIDE"
            users_with_issues.append(user)
        elif not effective_role or effective_role.strip() == '':
            status = "❌ ROLE EFFECTIF VIDE"
            users_with_issues.append(user)
        
        print(f"{user_id:<5} {username:<20} {role:<15} {poste:<20} {status}")
    
    # Résumé des problèmes
    print("\n" + "=" * 80)
    if users_with_issues:
        print(f"\n⚠️  {len(users_with_issues)} utilisateur(s) avec des problèmes de rôle détecté(s):\n")
        for user in users_with_issues:
            print(f"  - {user.get('username')} (ID: {user.get('id')})")
            print(f"    Role: '{user.get('role', '')}', Poste: '{user.get('poste', '')}'")
        
        print("\n💡 ACTIONS RECOMMANDÉES:")
        print("  1. Connectez-vous à l'admin Django: http://127.0.0.1:8000/admin/")
        print("  2. Assignez les rôles/postes manquants aux utilisateurs listés ci-dessus")
        print("  3. Valeurs possibles pour 'poste' (si role='personnel'):")
        print("     - receptioniste, infirmier, medecin, caissier, laborantin, pharmacien, comptable")
        print("  4. Valeurs possibles pour 'role':")
        print("     - admin, directeur, personnel")
    else:
        print("\n✅ Tous les utilisateurs ont des rôles valides!")
    
    print("=" * 80)


def main():
    print("=" * 80)
    print("DIAGNOSTIC DES UTILISATEURS - FULTANG HOSPITAL")
    print("=" * 80)
    print()
    
    # Se connecter
    token = login_as_admin()
    if not token:
        print("\n⚠️  Impossible de se connecter. Vérifiez:")
        print("  1. Le backend est démarré (http://127.0.0.1:8000)")
        print("  2. Les identifiants admin dans le script sont corrects")
        return
    
    # Récupérer les utilisateurs
    users = get_all_users(token)
    
    # Analyser
    analyze_users(users)


if __name__ == "__main__":
    main()
