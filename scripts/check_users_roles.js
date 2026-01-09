/**
 * Script de diagnostic pour vérifier les utilisateurs et leurs rôles
 * Usage: node check_users_roles.js
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL || "http://127.0.0.1:8000/api/";
const ADMIN_USERNAME = "admin";  // Remplacer par vos identifiants admin
const ADMIN_PASSWORD = "admin";  // Remplacer par vos identifiants admin

/**
 * Se connecter en tant qu'admin et récupérer le token
 */
async function loginAsAdmin() {
    try {
        const response = await axios.post(`${BACKEND_URL}login/`, {
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        });

        if (response.status === 200 && response.data.success) {
            console.log("✅ Connexion admin réussie\n");
            return response.data.data.access;
        } else {
            console.log(`❌ Échec de connexion:`, response.data);
            return null;
        }
    } catch (error) {
        console.error(`❌ Erreur de connexion au backend:`, error.message);
        return null;
    }
}

/**
 * Récupérer la liste de tous les utilisateurs
 */
async function getAllUsers(token) {
    try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Essayer différents endpoints possibles
        const endpoints = [
            "users/",
            "personnel/",
            "staff/",
            "admin/users/"
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${BACKEND_URL}${endpoint}`, { headers });
                if (response.status === 200) {
                    console.log(`✅ Données récupérées depuis: ${endpoint}\n`);
                    return response.data;
                }
            } catch {
                continue;
            }
        }

        console.log("❌ Aucun endpoint utilisateur trouvé");
        return [];

    } catch (error) {
        console.error(`❌ Erreur lors de la récupération des utilisateurs:`, error.message);
        return [];
    }
}

/**
 * Analyser et afficher les informations des utilisateurs
 */
function analyzeUsers(users) {
    console.log("=".repeat(80));
    console.log("ANALYSE DES UTILISATEURS ET LEURS RÔLES");
    console.log("=".repeat(80));

    if (!users || users.length === 0) {
        console.log("\n⚠️  Aucun utilisateur trouvé ou données non disponibles");
        console.log("\n💡 SOLUTION ALTERNATIVE:");
        console.log("   Connectez-vous directement à la base de données Django:");
        console.log("   python manage.py shell");
        console.log("   >>> from your_app.models import Personnel");
        console.log("   >>> for user in Personnel.objects.all():");
        console.log("   >>>     print(f'{user.username}: role={user.role}, poste={user.poste}')");
        return;
    }

    const usersWithIssues = [];

    // Si c'est un dictionnaire avec une clé 'results' (pagination Django)
    if (typeof users === 'object' && !Array.isArray(users)) {
        users = users.results || users.data || [];
    }

    console.log(`\n📊 Total d'utilisateurs: ${users.length}\n`);
    console.log(`${'ID'.padEnd(5)} ${'Username'.padEnd(20)} ${'Role'.padEnd(15)} ${'Poste'.padEnd(20)} Status`);
    console.log("-".repeat(80));

    for (const user of users) {
        const userId = user.id || 'N/A';
        const username = user.username || 'N/A';
        const role = user.role || '';
        const poste = user.poste || '';

        // Calculer le rôle effectif (comme dans le frontend)
        const effectiveRole = role === 'personnel' ? poste : role;

        // Détecter les problèmes
        let status = "✅";
        if (!role || role.trim() === '') {
            status = "❌ ROLE VIDE";
            usersWithIssues.push(user);
        } else if (role === 'personnel' && (!poste || poste.trim() === '')) {
            status = "⚠️  POSTE VIDE";
            usersWithIssues.push(user);
        } else if (!effectiveRole || effectiveRole.trim() === '') {
            status = "❌ ROLE EFFECTIF VIDE";
            usersWithIssues.push(user);
        }

        console.log(`${String(userId).padEnd(5)} ${String(username).padEnd(20)} ${String(role).padEnd(15)} ${String(poste).padEnd(20)} ${status}`);
    }

    // Résumé des problèmes
    console.log("\n" + "=".repeat(80));
    if (usersWithIssues.length > 0) {
        console.log(`\n⚠️  ${usersWithIssues.length} utilisateur(s) avec des problèmes de rôle détecté(s):\n`);
        for (const user of usersWithIssues) {
            console.log(`  - ${user.username} (ID: ${user.id})`);
            console.log(`    Role: '${user.role || ''}', Poste: '${user.poste || ''}'`);
        }

        console.log("\n💡 ACTIONS RECOMMANDÉES:");
        console.log("  1. Connectez-vous à l'admin Django: http://127.0.0.1:8000/admin/");
        console.log("  2. Assignez les rôles/postes manquants aux utilisateurs listés ci-dessus");
        console.log("  3. Valeurs possibles pour 'poste' (si role='personnel'):");
        console.log("     - receptioniste, infirmier, medecin, caissier, laborantin, pharmacien, comptable");
        console.log("  4. Valeurs possibles pour 'role':");
        console.log("     - admin, directeur, personnel");
    } else {
        console.log("\n✅ Tous les utilisateurs ont des rôles valides!");
    }

    console.log("=".repeat(80));
}

/**
 * Fonction principale
 */
async function main() {
    console.log("=".repeat(80));
    console.log("DIAGNOSTIC DES UTILISATEURS - FULTANG HOSPITAL");
    console.log("=".repeat(80));
    console.log();

    // Se connecter
    const token = await loginAsAdmin();
    if (!token) {
        console.log("\n⚠️  Impossible de se connecter. Vérifiez:");
        console.log("  1. Le backend est démarré (http://127.0.0.1:8000)");
        console.log("  2. Les identifiants admin dans le script sont corrects");
        return;
    }

    // Récupérer les utilisateurs
    const users = await getAllUsers(token);

    // Analyser
    analyzeUsers(users);
}

// Exécution
main().catch(error => {
    console.error("Erreur fatale:", error);
});
