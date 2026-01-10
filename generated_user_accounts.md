# Comptes Utilisateurs et Redirections

Ce document liste l'ensemble des comptes utilisateurs générés par les scripts de population de la base de données, ainsi que la page vers laquelle ils sont redirigés après connexion.

> **Note Importante** :
> - **Mot de passe par défaut** pour tous les comptes (sauf admin) : `MonMot2Passe!`
> - **Mot de passe Admin** : `Admin@123`

---

## 1. Administration & Direction

| Rôle | Email / Login | Redirection Frontend | URL |
|------|---------------|----------------------|-----|
| **Administrateur** | `admin` | Admin Home | `/admin/home` |
| **Directeur** | `user@direction.com` | Director Dashboard | `/director/dashboard` |

## 2. Personnel Administratif & Technique

| Rôle | Email (Pattern) | Quantité | Redirection Frontend | URL |
|------|-----------------|----------|----------------------|-----|
| **Comptable Matière** | `comptable@matiere[1-5].com` | 5 | Compta Matière Dashboard | `/compta-matiere/dashboard` |
| **Comptable Financier** | `comptable@finance[1-5].com` | 5 | Accountant Page | `/accountant/home` |
| **Pharmacien** | `user@pharmacie[1-5].com` | 5 | Pharmacist Dashboard | `/pharmacist/dashboard` |
| **Caissier** | `user@caisse[1-5].com` | 5 | Cashier Page | `/cashier/consultation-list` |
| **Réceptionniste** | `user@reception[1-5].com` | 5 | Receptionist Page | `/receptionist/patients` |

## 3. Personnel Médical (Par Service)

Les services sont : **chirurgie**, **medecinegenerale**, **pediatrie**, **urgences**, **laboratoire**.

### Médecins
*Redirection : Doctor Page (`/doctor/waiting-room`)*

| Service | Email Pattern | Quantité |
|---------|---------------|----------|
| Chirurgie | `medecin@chirurgie[1-5].com` | 5 |
| Médecine Générale | `medecin@medecinegenerale[1-5].com` | 5 |
| Pédiatrie | `medecin@pediatrie[1-5].com` | 5 |
| Urgences | `medecin@urgences[1-5].com` | 5 |
| Laboratoire | `medecin@laboratoire[1-5].com` | 5 |

### Infirmiers
*Redirection : Nurse Page (`/nurse/waiting-room`)*

| Service | Email Pattern | Quantité |
|---------|---------------|----------|
| Chirurgie | `infirmier@chirurgie[1-5].com` | 5 |
| Médecine Générale | `infirmier@medecinegenerale[1-5].com` | 5 |
| Pédiatrie | `infirmier@pediatrie[1-5].com` | 5 |
| Urgences | `infirmier@urgences[1-5].com` | 5 |
| Laboratoire | `infirmier@laboratoire[1-5].com` | 5 |

### Laborantins
*Redirection : Laboratory Assistant Page (`/laboratory-assistant/home`)*

| Service | Email Pattern | Quantité |
|---------|---------------|----------|
| Chirurgie | `laborantin@chirurgie[1-5].com` | 5 |
| Médecine Générale | `laborantin@medecinegenerale[1-5].com` | 5 |
| Pédiatrie | `laborantin@pediatrie[1-5].com` | 5 |
| Urgences | `laborantin@urgences[1-5].com` | 5 |
| Laboratoire | `laborantin@laboratoire[1-5].com` | 5 |

---

## Détail Technique des Redirections (Code Frontend)

Le fichier `Login.jsx` redirige l'utilisateur en fonction de son rôle (`poste`) normalisé :

- `admin` -> `/admin/home`
- `receptioniste` -> `/receptionist/patients`
- `infirmier` -> `/nurse/waiting-room`
- `medecin` -> `/doctor/waiting-room`
- `caissier` -> `/cashier/consultation-list`
- `laborantin` -> `/laboratory-assistant/home`
- `pharmacien` -> `/pharmacist/dashboard`
- `comptable` -> `/accountant/home`
- `comptable_matiere` -> `/compta-matiere/dashboard`
- `directeur` -> `/director/dashboard`
