# LoveTasks 💑

Application mobile de gestion de tâches ménagères partagée et gamifiée pour couples.

## 🎯 Description

LoveTasks est une application React Native + Node.js qui permet à deux personnes de gérer leurs tâches ménagères de manière ludique et équitable. L'application inclut:

- ✅ **Gestion de tâches** avec catégories et récurrence
- 🏆 **Système de gamification** avec points, niveaux et badges
- 💌 **Messages d'encouragement** entre partenaires
- 📊 **Statistiques détaillées** et classement
- 👤 **Profils personnalisables** avec avatars
- 🔥 **Séries quotidiennes** pour maintenir la motivation

## 🏗️ Architecture rzqr

```
LoveTasks/
├── frontend/          # Application Expo React Native
│   ├── src/
│   │   ├── screens/   # 5 écrans: Login, Tasks, Messages, Stats, Profile
│   │   ├── components/
│   │   └── utils/     # API et stockage
│   └── App.js
├── backend/           # Serveur Node.js Express
│   ├── server.js
│   └── .env
└── README.md
```

## 📱 Fonctionnalités principales

### 🔐 Authentification
- Connexion simple avec choix de personne (Person 1 / Person 2)
- Personnalisation du nom
- Session persistante avec AsyncStorage

### ✅ Gestion des tâches
- Création de tâches avec titre, description, catégorie
- Catégories: Ménage 🧹, Cuisine 🍳, Courses 🛒, Bricolage 🔧, Autre 📋
- Attribution de points (1-5)
- Récurrence (quotidienne, hebdomadaire, mensuelle)
- Marquage comme complété avec notification automatique

### 🏆 Gamification
- Points accumulés par tâche complétée
- Système de niveaux (1 niveau = 10 points)
- Séries quotidiennes avec compteur 🔥
- Badges à débloquer:
  - 🎯 Premier Pas (1 tâche)
  - ⭐ Contributeur (10 tâches)
  - 🏆 Expert (50 tâches)
  - 👑 Légende (100 tâches)
  - 🔥 Séries (3, 7, 30 jours consécutifs)
  - 🌟 Niveaux (5, 10)

### 💌 Messages d'encouragement
- Envoi de messages entre partenaires
- 4 types: Appréciation 💖, Encouragement 💪, Célébration 🎉, Rappel ⏰
- Notifications automatiques lors de la complétion de tâches
- Compteur de messages non lus

### 📊 Statistiques
- Tâches complétées (total, hebdomadaire)
- Points totaux et niveau actuel
- Séries en cours
- Répartition par catégorie avec graphiques
- Classement entre partenaires

### 👤 Profil personnalisable
- Modification du nom
- Choix d'avatar (12 options)
- Visualisation de tous les badges
- Statistiques personnelles détaillées
- Déconnexion

## 🚀 Installation

### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env`:
```
MONGODB_URI=mongodb://kaizen971:secret@192.168.1.72:27017/
```

Démarrer le serveur:
```bash
npm start
```

Le serveur démarre sur le port 3001.

### Frontend

```bash
cd frontend
npm install
expo start
```

Scannez le QR code avec l'application Expo Go sur votre téléphone.

## 🔌 Configuration API

- **Backend local**: `http://localhost:3001/LoveTasks`
- **Production**: `https://mabouya.servegame.com/LoveTasks/LoveTasks`

Le frontend est configuré pour utiliser l'URL de production par défaut.

### Caddy Configuration

```caddy
mabouya.servegame.com {
  handle_path /LoveTasks* {
    reverse_proxy 192.168.1.72:3001
  }
}
```

## 📝 Endpoints API

### Tasks
- `GET /LoveTasks/tasks` - Liste des tâches
- `POST /LoveTasks/tasks` - Créer une tâche
- `PUT /LoveTasks/tasks/:id` - Mettre à jour
- `DELETE /LoveTasks/tasks/:id` - Supprimer

### Users
- `GET /LoveTasks/users` - Liste des utilisateurs
- `POST /LoveTasks/users` - Créer/mettre à jour
- `PUT /LoveTasks/users/:identifier` - Modifier profil

### Feedback
- `GET /LoveTasks/feedback/:userId` - Messages reçus
- `POST /LoveTasks/feedback` - Envoyer un message
- `PUT /LoveTasks/feedback/:id/read` - Marquer comme lu
- `GET /LoveTasks/feedback/:userId/unread-count` - Compteur

### Stats & Badges
- `GET /LoveTasks/stats/:userId` - Statistiques détaillées
- `GET /LoveTasks/badges` - Liste des badges disponibles
- `GET /LoveTasks/leaderboard` - Classement
- `GET /LoveTasks/health` - Santé du serveur

## 🗄️ Base de données

MongoDB avec 3 collections principales:
- **tasks**: Tâches avec statut, points, catégorie, récurrence
- **users**: Utilisateurs avec stats, badges, streak, avatar
- **feedbacks**: Messages d'encouragement entre utilisateurs

## 🎨 UI/UX

L'interface utilise un design moderne et convivial:
- Palette de couleurs: Indigo (#6366f1) et vert (#059669)
- Navigation par onglets (Bottom Tabs)
- Animations fluides
- Feedback visuel immédiat
- Design responsive
- Pull-to-refresh sur les listes
- Modales pour les formulaires

## 🛠️ Technologies

**Frontend:**
- React Native (Expo)
- React Navigation (Native Stack + Bottom Tabs)
- AsyncStorage (stockage local)
- React Hooks (useState, useEffect, useCallback)

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- CORS
- dotenv

## 🔒 Sécurité

⚠️ **Note**: Cette version utilise une authentification simplifiée. Pour la production:
- Ajouter un véritable système d'authentification avec JWT
- Hasher les mots de passe avec bcrypt
- Ajouter la validation des entrées
- Implémenter HTTPS
- Ajouter rate limiting

## 📄 Licence

Projet personnel - LoveTasks
