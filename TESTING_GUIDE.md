# Guide de Test - Pages Migrées

## Démarrage de l'Application

```bash
cd d:\MAGIE\fultang-frontend
npm run dev
```

## URLs de Test

### ComptaMatiere (Comptable Matière)
- **Dashboard:** http://localhost:5173/compta-matiere/dashboard
- **Émettre un besoin:** http://localhost:5173/compta-matiere/emit-need
- **Enregistrer livraison:** http://localhost:5173/compta-matiere/register-delivery
- **Enregistrer sortie:** http://localhost:5173/compta-matiere/register-output
- **Rapports:** http://localhost:5173/compta-matiere/reports
- **Liste du matériel:** http://localhost:5173/compta-matiere/material-list
- **Liste des sorties:** http://localhost:5173/compta-matiere/output-list

### Director (Directeur)
- **Dashboard:** http://localhost:5173/director/dashboard
- **Rapports:** http://localhost:5173/director/reports

### Pharmacist (Pharmacien)
- **Dashboard:** http://localhost:5173/pharmacist/dashboard
- **Émettre un besoin:** http://localhost:5173/pharmacist/emit-need
- **Ventes du jour:** http://localhost:5173/pharmacist/daily-sales
- **Inventaire:** http://localhost:5173/pharmacist/inventory
- **Rapports:** http://localhost:5173/pharmacist/reports

## Rôles Requis

Pour accéder aux pages, assurez-vous d'être connecté avec le bon rôle:

- **ComptaMatiere:** Role = "Accountant"
- **Director:** Role = "Director"  
- **Pharmacist:** Role = "Pharmacist"

## Fonctionnalités à Tester

### ComptaMatiere

#### Dashboard (`/compta-matiere/dashboard`)
- [ ] Affichage des statistiques (Besoins en attente, Livraisons, Sorties, Alertes stock)
- [ ] Affichage des besoins en attente dans un tableau
- [ ] Actions rapides (boutons pour émettre besoin, enregistrer livraison, etc.)
- [ ] Navigation via la barre latérale

#### Émettre un Besoin
- [ ] Formulaire avec informations générales (département, demandeur, date, urgence)
- [ ] Ajout/suppression de lignes de matériel
- [ ] Validation et soumission du formulaire
- [ ] Message de succès

#### Enregistrer une Livraison
- [ ] Choix entre matériel existant et nouveau matériel
- [ ] Formulaire adaptatif selon le type (Médical vs Durable)
- [ ] Génération automatique de code pour nouveau matériel
- [ ] Calcul automatique du montant total
- [ ] Validation et enregistrement

#### Enregistrer une Sortie
- [ ] Génération automatique du numéro de sortie
- [ ] Recherche de matériel avec autocomplétion
- [ ] Vérification du stock disponible
- [ ] Enregistrement dans localStorage
- [ ] Message de confirmation

#### Rapports
- [ ] Création de nouveau rapport
- [ ] Liste des rapports envoyés
- [ ] Liste des rapports reçus
- [ ] Exportation en PDF (individual et liste complète)
- [ ] Modal de détails des rapports

#### Liste du Matériel
- [ ] Recherche par nom ou code
- [ ] Filtrage par catégorie (Médical/Durable)
- [ ] Affichage des détails en modal
- [ ] Exportation PDF de la liste
- [ ] Indicateur de stock faible (rouge si quantité < 10)

#### Liste des Sorties
- [ ] Recherche par N°, service, matériel
- [ ] Filtrage par motif (défectueux, périmé, vente, transfert, utilisation)
- [ ] Filtrage par période (aujourd'hui, semaine, mois)
- [ ] Affichage détaillé des articles par sortie
- [ ] Exportation PDF

### Director

#### Dashboard (`/director/dashboard`)
- [ ] Statistiques des besoins (Total, En attente, Approuvés, Rejetés)
- [ ] Liste des besoins avec filtres
- [ ] Modal de détails d'un besoin
- [ ] Boutons Approuver/Rejeter (si en attente)

#### Rapports
- [ ] Formulaire de rédaction de rapport
- [ ] Sélection du destinataire (personnel)
- [ ] Envoi de rapport
- [ ] Liste des rapports envoyés
- [ ] Liste des rapports reçus (avec badge "nouveau")
- [ ] Exportation PDF

### Pharmacist

#### Dashboard (`/pharmacist/dashboard`)
- [ ] Statistiques (Total médicaments, Stock faible, Ventes du jour, CA du jour)
- [ ] Liste des médicaments en stock faible
- [ ] Liste des ventes récentes

#### Émettre un Besoin
- [ ] Formulaire similaire à ComptaMatiere
- [ ] Adapté au contexte pharmaceutique

#### Ventes du Jour
- [ ] Enregistrement de ventes
- [ ] Recherche de médicaments
- [ ] Calcul automatique du total
- [ ] Historique des ventes

#### Inventaire
- [ ] Liste des stocks actuels
- [ ] Archivage d'articles
- [ ] Signalement de produits défectueux/périmés
- [ ] Génération de rapport pour le comptable

#### Rapports
- [ ] Création et consultation de rapports
- [ ] Similaire à ComptaMatiere

## Données Mockées

Toutes les pages utilisent des données fictives stockées en mémoire ou dans localStorage. Les données incluent:

### ComptaMatiere
- **Matériels:** Gants médicaux, Seringues, Compresses, Stéthoscopes, Thermomètres, Masques
- **Sorties:** 3 sorties initiales avec différents motifs

### Director
- **Besoins:** 5 besoins avec différents statuts (en attente, approuvé, rejeté)
- **Rapports:** Quelques rapports envoyés et reçus

### Pharmacist
- **Médicaments:** Paracétamol, Ibuprofène, Amoxicilline, Vitamine C, Oméprazole
- **Ventes:** 3 ventes initiales

## Debugging

Si une page ne charge pas:

1. **Vérifier la console du navigateur** pour les erreurs
2. **Vérifier que vous êtes connecté** avec le bon rôle
3. **Vérifier les imports** dans les fichiers concernés
4. **Vérifier que le serveur de développement** est bien lancé

## Erreurs Communes

### "Module not found"
- Vérifier que tous les fichiers ont bien été copiés
- Vérifier les chemins d'import (relatifs vs absolus)

### "Access Denied"
- Vérifier que vous êtes connecté avec le bon rôle
- Vérifier le `requiredRole` dans chaque composant

### "Component not rendering"
- Vérifier les exports/imports (named vs default)
- Vérifier la syntaxe JSX

## Support

Pour toute question ou problème:
1. Consulter `MIGRATION_SUMMARY.md`
2. Vérifier les fichiers sources dans `IHM_Front`
3. Comparer avec les fichiers migrés dans `fultang-frontend`
