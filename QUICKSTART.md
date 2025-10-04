# 🚀 Guide de démarrage rapide - LoveTasks

## Prérequis
- Node.js installé
- MongoDB accessible
- Expo Go installé sur votre téléphone

## Démarrage en 3 étapes

### 1. Démarrer le backend
```bash
cd /home/cheetoh/pi-agent/repo/LoveTasks/backend
npm start
```

Vous devriez voir:
```
Server running on port 3001
API accessible at http://localhost:3001/LoveTasks
MongoDB Connected: 192.168.1.72
```

### 2. Démarrer le frontend
Dans un nouveau terminal:
```bash
cd /home/cheetoh/pi-agent/repo/LoveTasks/frontend
npm start
```

### 3. Tester sur votre téléphone
1. Ouvrez l'application **Expo Go** sur votre téléphone
2. Scannez le QR code affiché dans le terminal
3. L'application devrait se charger

## Premier usage

1. **Écran de connexion** :
   - Entrez votre nom
   - Sélectionnez "Personne 1" ou "Personne 2"
   - Cliquez sur "Se connecter"

2. **Créer une tâche** :
   - Appuyez sur "+ Nouvelle tâche"
   - Remplissez le titre
   - Sélectionnez une catégorie (🧹, 🍳, 🛒, 🔧, 📋)
   - Choisissez les points (1-5)
   - Cliquez sur "Créer"

3. **Compléter une tâche** :
   - Appuyez sur une tâche pour la marquer comme complétée
   - Vous gagnez des points !
   - Un message est automatiquement envoyé à votre partenaire

4. **Explorer les onglets** :
   - **✓ Tâches** : Liste de toutes les tâches
   - **💌 Messages** : Messages d'encouragement
   - **📊 Stats** : Vos statistiques et classement
   - **👤 Profil** : Personnaliser avatar et voir badges

## Tester avec 2 utilisateurs

### Sur le même téléphone
1. Connectez-vous en tant que "Personne 1"
2. Créez quelques tâches
3. Complétez des tâches
4. Déconnectez-vous (Profil → Déconnexion)
5. Connectez-vous en tant que "Personne 2"
6. Vérifiez les messages reçus et le classement

### Sur 2 téléphones différents
1. Lancez l'app sur les 2 téléphones
2. Personne 1 se connecte sur téléphone 1
3. Personne 2 se connecte sur téléphone 2
4. Chacun peut créer et compléter des tâches
5. Les messages et stats sont partagés en temps réel

## Fonctionnalités à tester

### Gamification
- [ ] Compléter 1 tâche → Badge "Premier Pas" 🎯
- [ ] Compléter 10 tâches → Badge "Contributeur" ⭐
- [ ] Compléter des tâches 3 jours d'affilée → Badge "Série de 3" 🔥
- [ ] Atteindre 10 points → Niveau 2
- [ ] Vérifier le classement dans Stats

### Messages
- [ ] Compléter une tâche → Message automatique envoyé
- [ ] Envoyer un message d'appréciation 💖
- [ ] Envoyer un encouragement 💪
- [ ] Vérifier le compteur de messages non lus
- [ ] Marquer un message comme lu

### Profil
- [ ] Changer son nom
- [ ] Sélectionner un avatar différent
- [ ] Voir ses badges débloqués
- [ ] Consulter ses statistiques

### Tâches
- [ ] Créer une tâche de ménage 🧹
- [ ] Créer une tâche de cuisine 🍳
- [ ] Créer une tâche de 5 points
- [ ] Compléter une tâche
- [ ] Supprimer une tâche (appui long)

## Vérifications

### Backend fonctionne ?
```bash
curl http://localhost:3001/LoveTasks/health
# Devrait retourner: {"status":"ok","message":"LoveTasks API is running"}
```

### Voir les utilisateurs
```bash
curl http://localhost:3001/LoveTasks/users
```

### Voir les tâches
```bash
curl http://localhost:3001/LoveTasks/tasks
```

### Voir les badges disponibles
```bash
curl http://localhost:3001/LoveTasks/badges
```

## Résolution de problèmes

### "Cannot connect to server"
- Vérifiez que le backend est démarré
- Vérifiez la connexion MongoDB
- L'app utilise l'URL de production par défaut

### "Expo Go error"
- Assurez-vous que le frontend est démarré
- Vérifiez que votre téléphone est sur le même réseau WiFi
- Réessayez de scanner le QR code

### "MongoDB connection failed"
- Vérifiez que MongoDB est accessible à `192.168.1.72:27017`
- Vérifiez le fichier `.env` dans backend
- Vérifiez les credentials

### Messages d'avertissement MongoDB
Les warnings `useNewUrlParser` et `useUnifiedTopology` sont normaux et peuvent être ignorés (déjà corrigés dans le code).

## URLs importantes

- Backend local: `http://localhost:3001/LoveTasks`
- Backend production: `https://mabouya.servegame.com/LoveTasks`
- API Health check: `http://localhost:3001/LoveTasks/health`

## Support

Pour toute question ou problème:
1. Vérifiez les logs du backend
2. Vérifiez les erreurs dans Expo
3. Consultez README.md pour la documentation complète
4. Consultez AMELIORATIONS.md pour les détails des fonctionnalités

Bon usage de LoveTasks ! 💑✨
