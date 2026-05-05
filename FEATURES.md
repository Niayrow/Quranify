# 📖 Documentation des Fonctionnalités - Quranify

Quranify est une plateforme web premium et immersive dédiée à l'écoute et à la lecture du Noble Coran. Voici la liste complète des fonctionnalités implémentées.

---

## 🚀 Expérience PWA & Installation
- **Installation One-Click** : Application installable sur PC, Android et iOS via un bouton dédié ou le menu du navigateur.
- **Support Hors Ligne** : Grâce au Service Worker, l'application se charge instantanément même sans connexion internet.
- **Mode Offline Automatique** : Si vous perdez la connexion, l'application bascule automatiquement en mode hors ligne et ne propose que les sourates que vous avez téléchargées.

## 🎧 Lecteur Audio Premium
- **Interface Immersive** : Design inspiré de Spotify avec flou artistique (glassmorphism).
- **Visualiseur Dynamique** : Analyseur de fréquences audio en temps réel pendant l'écoute.
- **Contrôles Complets** : Lecture/Pause, Suivant/Précédent, Mode Aléatoire (Shuffle) et Mode Boucle (Loop).
- **Contrôle Écran Verrouillé** : Intégration de l'API Media Session pour contrôler l'audio depuis l'écran de verrouillage et le centre de notifications (Play, Pause, Suivant, Précédent).
- **Métadonnées Natives** : Affichage du titre de la sourate, du nom du récitateur et de sa photo directement dans les notifications système.
- **Barre de Lecture Persistante** : Le lecteur reste accessible en bas de l'écran lors de la navigation dans le catalogue.

## 📥 Gestion des Téléchargements
- **Téléchargement Manuel** : Possibilité de télécharger chaque sourate individuellement pour une écoute sans internet.
- **Gestion du Cache Audio** : Utilisation de l'API Cache pour stocker les fichiers MP3 de manière sécurisée sur votre appareil.
- **Badge de Statut** : Indicateur visuel sur chaque carte de sourate pour savoir si elle est disponible hors ligne.

## 📖 Lecteur de Sourates (SurahReader)
- **Synchronisation Verset par Verset** : Le texte défile et s'illumine automatiquement en fonction de l'audio.
- **Affichage Multilingue** : Basculez instantanément entre l'Arabe, la Phonétique et la Traduction Française.
- **Mode Apprentissage (Loop)** : Possibilité de mettre un verset spécifique en boucle pour faciliter la mémorisation.
- **Navigation Intelligente** : Cliquez sur un verset pour que l'audio saute directement à ce moment précis.

## 📻 Mode Radio Coran
- **Écoute Continue** : Enchaînement automatique des sourates sans intervention.
- **Sélection de Scope** : Choisissez d'écouter tout le Coran ou seulement le **Juz Amma** (les 30 dernières sourates).
- **Multi-Récitateurs** : Le mode radio peut mélanger les voix de plusieurs récitateurs populaires.

## 🎨 Personnalisation & Thèmes
- **Thèmes Atmosphériques** : Changez l'ambiance visuelle en un clic :
  - **Classique** : Bleu profond et serein.
  - **Nuit Étoilée** : Sombre et céleste.
  - **Crépuscule (Sunset)** : Tons chauds et méditatifs.
  - **Forêt (Forest)** : Vert apaisant et naturel.
  - **Désert** : Tons sable et terreux.
- **Fonds Dynamiques** : Arrière-plans animés avec des orbes de lumière qui réagissent doucement.

## 🔍 Recherche & Navigation
- **Recherche Rapide** : Par nom de sourate (français/arabe) ou par numéro.
- **Recherche Vocale** : Dites "Sourate Al-Mulk" ou le nom d'un récitateur pour trouver instantanément.
- **Sélecteur de Récitateurs** : Accès rapide à plus de 40 récitateurs mondiaux avec barre de recherche et filtres.

## 📊 Statistiques & Historique
- **Tracker d'Activité** : Suivi en temps réel de votre temps d'écoute (Aujourd'hui / Total).
- **Historique d'Écoute** : Accès rapide aux dernières sourates écoutées sur la page d'accueil.
- **Reprise de Session** : Une bannière vous propose de reprendre là où vous vous étiez arrêté lors de votre dernière visite.
- **Favoris** : Enregistrez vos sourates préférées pour les retrouver en un clic.

## 🛠️ Technique & Performance
- **Optimisation Mobile** : Interface entièrement repensée pour une utilisation fluide au pouce sur smartphone.
- **Nettoyage Automatique** : Gestion intelligente des ressources audio pour éviter les fuites de mémoire.
- **SEO & Métadonnées** : Balises optimisées pour le partage et le référencement.

---
*Développé avec excellence pour une expérience spirituelle sans compromis.*
