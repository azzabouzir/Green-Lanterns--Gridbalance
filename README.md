Intelligent & Fair Load Shedding Platform— version 1 (prototype fonctionnel)

Plateforme d'aide à la décision pour le délestage électrique en Tunisie. Elle relie, dans une seule application cliquable, le Dispatching National (DN), les CRC (Nord et Sud), les BCC, les industriels et les citoyens.

> À retenir
> - Le livrable est un seul fichier : `gridbalance.html` (≈ 57 Ko). Il s'exécute dans un navigateur, sans installation, sans serveur, sans connexion Internet.
> - Toutes les données (BCC, villes, puissances, historiques, coupures) sont simulées. Ce ne sont pas des données opérationnelles réelles de la STEG.
> - L'« IA » est un moteur de règles et d'optimisation déterministe. Elle propose ; l'opérateur décide. Aucune coupure n'est jamais déclenchée automatiquement.

---


`gridbalance.html` contient tout, en un seul fichier texte :

| Partie | Taille | Rôle |
|---|---|---|
| HTML | quelques lignes | Structure : menu latéral, en-tête, zone de contenu, fenêtre modale |
| CSS | ≈ 3,6 Ko | Styles, thème clair/sombre, mise en page adaptative |
| JavaScript | ≈ 52 Ko | Données, moteur de décision, 17 vues, 31 fonctions |

Aucune bibliothèque externe, aucun appel réseau, aucun stockage navigateur. L'état vit en mémoire : recharger la page le remet à zéro.



- Un navigateur récent : Chrome, Edge, Firefox ou Safari (JavaScript activé).
- Un écran d'ordinateur, de tablette ou de téléphone (l'affichage s'adapte ; l'ordinateur est plus confortable).

Rien d'autre : pas de Node.js, pas de Python, pas de base de données.



1. Enregistrez `gridbalance.html` sur votre ordinateur.
2. Double-cliquez  dessus (ou faites-le glisser dans une fenêtre du navigateur).
3. La page de connexion s'affiche.

Option (facultative) — serveur local, si votre navigateur bloque l'ouverture de fichiers :





La connexion est simulée : on choisit un profil, sans mot de passe. Chaque profil ne voit que ses propres pages.

| Profil | À choisir sur la page de connexion | Pages disponibles |
|---|---|---|
| STEG Administrator | — | National Overview, Supervision, CRCs, BCCs & Cities, Scenarios, Industrial Flexibility, Citizens & Alerts, Fairness & History, Event Log |
| National Dispatching (DN) | — | National Overview, AI & Scenarios, Supervision, Industrial Flexibility, Fairness & History, Event Log |
| CRC | CRC North ou CRC South | CRC Dashboard, Event Log |
| BCC | un des 6 BCC : Grombalia, Tunis, Gafsa, Sfax, Sousse, Gabès | All BCCs, Load Shedding, Outage History |
| Citizen| un compte existant Sami B. de Sousse, Amel K. de Sfax) ou Sign up | My Electricity, My Alerts |
| Industrial consumer| Factory A, B ou C | My Flexibility |

Boutons de l'en-tête : ← Back(page précédente, puis retour à la connexion), Log out, Theme (clair / sombre).

Inscription citoyen (Sign up): nom, téléphone, gouvernorat, ville (liste, ou saisie libre si votre ville est absente : elle est alors ajoutée automatiquement sous son gouvernorat) et canal d'alerte (App, SMS ou App + SMS).



Au chargement, un cas de délestage est déjà en cours pour que toutes les pages soient parlantes :

- le DN a approuvé le scénario « Flexibility + Rotation » pour 300 MW ;
- les deux CRC ont réparti leur part entre leurs BCC (CRC Nord 89 MW, CRC Sud 165 MW, plus la flexibilité) ;
- la plupart des BCC exécutent ; Sousse a confirmé (alerte envoyée) ; Gafsa attend sa confirmation ;
- Factory A est disponible, Factory B a une demande à traiter, Factory C a envoyé une proposition au DN ;
- le tableau de bord du DN affiche : requis 300 MW, réel 239 MW, écart 61 MW, 24 départs ouverts, 4 BCC actifs, énergie non fournie 1 919 MWh.

Le bouton Reload example (page de connexion) recharge cet exemple.


1. DN → *AI & Scenarios* → Analyze & generate : trois scénarios apparaissent ; ouvrez Why this scenario ; cliquez Approve & send to CRCs
2. CRC South → l'instruction du DN est là ; l'IA propose une répartition entre les BCC (le total doit égaler l'ordre) → Approve & send to BCCs
3. BCC Gafsa → Load Shedding : déficit et montant à remplacer, villes proposées par l'IA, vérifications → Confirm load shedding
4. Cliquez Advance execution : Scheduled → Alert sent → In progress → Restored*.
5. Citizen  → alerte, statut et explication « Pourquoi ? » ; Industrial (*Factory B*) → Accept ou Decline ou envoyez une proposition ; DN → Industrial Flexibility → validez la proposition.
6. DN ou Administrateur → tableau de bord, Fairness & History et journal se mettent à jour.

> Approuver un nouveau scénario (étape 1) remplace l'exemple en cours : les BCC repartent de zéro et suivent votre parcours. Reload example rétablit l'exemple initial.


-Score d'équité d'une ville : plus il est élevé, plus sa charge récente est légère. Il combine minutes cumulées, fréquence, coupures récentes, priorité et consommateurs.
- Répartition proportionnelle à un poids, avec un plafond de capacité par candidat ; les sites critiques protégés sont retirés de la capacité et une ville protégée n'est jamais coupée.
- Trois scénarios au niveau des CRC : *Traditional Rotation Balanced Rotation Flexibility + Rotation (« éviter avant de couper » : la flexibilité passe avant la coupure conventionnelle).
- Qualité des données : *Good* (< 10 min), Delayed (< 30 min), Stale (≥ 30 min). Si un BCC est Stale, aucune recommandation n'est émise et la confirmation est bloquée.
- Rotation au BCC : deux fenêtres de 40 minutes, l'ordre des villes alterne.
- Alertes citoyens : environ 15 minutes avant chaque coupure planifiée.



Tout est simulé et construit au démarrage :

- BCC (CRC Nord : Grombalia, Tunis ; CRC Sud : Gafsa, Sfax, Sousse, Gabès ...), 24 villes fictives (4 par BCC) ;
- situation nationale : demande 4 500 MW, production 4 200 MW, déficit 300 MW ;
- 8 entrées au registre des infrastructures critiques (7 protégées) ;
- 3 usines flexibles + stockage 25 MW + autres alternatives 15 MW ;
- environ 12 000 citoyens inscrits, comptés par ville(jamais une ligne par citoyen).



- Reload example sur la page de connexion, ou recharger la page (F5) : tout revient à l'état de départ.



| Problème | Solution |
|---|---|
| Page blanche | Vérifiez que JavaScript est activé et utilisez un navigateur récent. |
| Le fichier s'ouvre comme du texte | Ouvrez-le avec le navigateur (clic droit → *Ouvrir avec*), pas dans un éditeur. |
| Ouvert depuis une messagerie / un aperçu | Enregistrez d'abord le fichier sur l'ordinateur, puis ouvrez-le. |
| Affichage trop sombre ou trop clair | Bouton Theme en haut à droite. |
| Une action n'a « rien fait » | Certaines actions sont refusées volontairement (ex. confirmer avec un BCC en données Stale, retirer une ville avec une coupure en cours) : un message explique pourquoi. |
| Mes modifications ont disparu | Normal : rien n'est enregistré ; recharger la page réinitialise l'état. |



L'application fonctionne hors ligne : aucune donnée saisie (noms, téléphones, villes) n'est envoyée ni stockée ailleurs que dans la mémoire de l'onglet, et disparaît à la fermeture.

## 12. Limites connues

- Pas de serveur, de base de données ni d'authentification réelle ; pas d'utilisateurs simultanés.
- Prévisions de demande (courbes) fixes et illustratives ; carte de la Tunisie schématique (sans valeur cartographique).
- Le moteur est heuristique : pas de prévision de charge, pas d'optimisation mathématique globale, pas de modèle du réseau électrique.
- Les alertes sont simulées à l'écran : aucun SMS ni notification réelle.


Le fichier est du texte : ouvrez-le dans un éditeur pour l'adapter.

| Où | Quoi |
|---|---|
| `BCCS`, `POP`, `DM`, `PR`, `NC` | BCC, CRC, gouvernorats, populations, demandes, priorités, nombre de coupures |
| `WT` | Poids du score d'équité |
| `init()` | Construction de toutes les données (à remplacer par des appels API pour des données réelles) |
| `seed()` | L'exemple chargé au démarrage |
| `alloc()`, `gen()`, `propose()`, `plan()` | Répartition proportionnelle, scénarios du DN, répartition CRC → BCC, rotation au BCC |
| `V.xxx` | Une fonction par page ; `render()` affiche la page selon le profil |


Le comportement a été contrôlé par un test de fumée automatisé (rendu de toutes les pages des six profils, inscription avec une ville absente, parcours complet DN → CRC → BCC jusqu'à la clôture, comptage de 100 000 citoyens, ajout / retrait de villes par l'administrateur) et par une navigation réelle sur 14 écrans dans Chromium, sans erreur JavaScript.

---

*Prototype de démonstration — voir aussi le rapport de projet `Rapport_GRIDBALANCE.docx` (9 pages).*
