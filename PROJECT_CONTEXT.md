# Projet E-commerce Couture — Documentation IA

Version : MVP
Type : Application e-commerce
Architecture : Backend API REST + Frontend client
Objectif : vendre des créations de couture personnalisables


==================================================
1. CONTEXTE DU PROJET
==================================================

Ce projet est un site e-commerce spécialisé dans la vente
de créations artisanales de couture.

Les produits peuvent être personnalisés par le client.

Exemples :

- tissu
- couleur
- finition
- taille
- options personnalisées


Le projet doit rester :

- simple
- maintenable
- sécurisé
- évolutif


Le MVP privilégie :

- fonctionnalités essentielles
- faible complexité
- séparation claire des responsabilités


==================================================
2. STACK TECHNIQUE
==================================================


Backend :

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Zod


Sécurité :

- Helmet
- CORS
- express-rate-limit


Images :

- Multer
- Cloudinary


Paiement :

- Stripe Checkout


Frontend :

- gestion panier localStorage


==================================================
3. PRINCIPES ARCHITECTURE
==================================================


Architecture en couches :

Route
 |
 v
Controller
 |
 v
Service
 |
 v
Prisma
 |
 v
Database



Règles :

Les routes ne contiennent pas de logique métier.

Les controllers gèrent uniquement HTTP.

Les services contiennent la logique métier.

Prisma est uniquement utilisé dans les services.



==================================================
4. AUTHENTIFICATION
==================================================


Système :

JWT + bcrypt


Fonctions :

- inscription
- connexion
- protection des routes
- gestion des rôles


Rôles :

ADMIN

CUSTOMER



Un utilisateur possède :

- email
- passwordHash
- prénom
- nom
- rôle



Les mots de passe :

NE JAMAIS stocker en clair.


Utiliser :

hashPassword()

comparePassword()



==================================================
5. UTILISATEURS
==================================================


Routes :

GET /api/users/me

Retourne le profil connecté.



PUT /api/users/me

Modification :

- prénom
- nom
- email



PUT /api/users/password

Modification mot de passe.



Règle :

Un utilisateur ne peut accéder
qu'à ses propres données.



==================================================
6. PRODUITS
==================================================


Un produit représente une création vendue.


Informations :

- nom
- slug
- description
- prix
- catégorie
- état actif



Un produit actif est visible publiquement.



Les produits peuvent avoir :

- images
- options
- variantes



==================================================
7. CATEGORIES
==================================================


Une catégorie organise les produits.


Exemples :

Maison

Enfants

Accessoires



Routes :

GET /api/categories

Liste publique.



GET /api/categories/:slug

Retourne :

- catégorie
- produits associés



Administration :

POST

PUT

DELETE



==================================================
8. OPTIONS PRODUITS
==================================================


IMPORTANT :

Les options ne sont PAS une liste fixe.


Ne jamais coder :

tissu/couleur/taille en dur.


Le système accepte n'importe quel type.


Exemple :


OptionGroup :

type = "matiere"


Values :

- coton
- lin
- velours



Chaque valeur peut avoir :

- label
- prix supplémentaire
- disponibilité



==================================================
9. IMAGES PRODUITS
==================================================


Les images sont stockées sur Cloudinary.


La base contient uniquement :

URL de l'image.



Table logique :

product_images


Une image peut être liée :

- uniquement au produit

ou

- à une option



Exemple :


Produit :

Tote bag


Images :

default.jpg


Liberty.jpg

lié à :

OptionValue = Liberty


Quand le client change une option :

Le frontend affiche l'image correspondante.



==================================================
10. UPLOAD IMAGES
==================================================


Flux :


Frontend

|

FormData

|

Backend

|

Multer

|

Cloudinary

|

URL

|

Database



Restrictions MVP :

- jpg
- jpeg
- png
- webp

Taille max :

5MB



Seul ADMIN peut uploader.



==================================================
11. PANIER
==================================================


Le panier est géré côté frontend.


Stockage :

localStorage


Le backend ne maintient pas de panier.



Le panier contient :

- produit
- quantité
- options choisies
- prix affiché



IMPORTANT :

Le backend recalcul le prix
lors de la création commande.



==================================================
12. COMMANDES
==================================================


Une commande représente un achat validé.



Création :

POST /api/orders



Le backend :

- vérifie le produit
- recalcule le prix
- crée un snapshot



Le snapshot permet de garder
l'historique même si le produit change.



==================================================
13. STATUTS COMMANDES
==================================================


Les statuts sont gérés par Prisma.


Ne jamais dupliquer la liste
dans le code.



Workflow :


PENDING

|

PAID

|

PROCESSING

|

SHIPPED

|

DELIVERED



Autres états :

CANCELLED

REFUNDED



==================================================
14. COMMANDES CLIENT
==================================================


Routes :


GET /api/orders

Liste des commandes du client.


GET /api/orders/:id

Détail commande.



Un client ne peut jamais voir
une commande qui ne lui appartient pas.



==================================================
15. ADMIN COMMANDES
==================================================


Routes :


GET /api/orders/admin/all


Liste complète.



PATCH /api/orders/:id/status


Modifier statut.



Accès :

ADMIN uniquement.



==================================================
16. PAIEMENT
==================================================


Stripe Checkout utilisé.


Flux :


Client

|

Création session Stripe

|

Paiement

|

Webhook Stripe

|

Mise à jour commande



Ne jamais faire confiance
au frontend pour confirmer un paiement.



==================================================
17. SECURITE
==================================================


Actif :


Helmet

Protection headers.



CORS

Autorise uniquement frontend.



Rate limit

Protection brute force.



Validation Zod

Toutes les entrées API
doivent être validées.



Gestion erreurs globale.



==================================================
18. REGLES POUR IA / DEVELOPPEUR
==================================================


Avant de modifier :

Comprendre l'existant.


Ne jamais :

- casser Prisma
- créer une nouvelle structure inutile
- dupliquer la logique
- mettre de logique métier dans controller


Toujours :

- utiliser les services
- valider les entrées
- protéger les routes sensibles


==================================================
19. EXTENSIONS FUTURES
==================================================


Non inclus MVP :


- emails
- livraison avancée
- coupons
- favoris
- avis clients
- dashboard complet
- analytics


Ces fonctionnalités doivent être ajoutées
uniquement après validation MVP.


==================================================
FIN DOCUMENTATION
==================================================