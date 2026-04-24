// Source of truth for the 78 codified screens (Kargo cahier des charges v4.0 Fusion §11).
// Each route imports its meta from here so we keep traceability spec ↔ code.

export type ScreenModule =
  | 'Common'
  | 'Marketplace'
  | 'Rental'
  | 'Transit'
  | 'Wallet'
  | 'Trust'
  | 'Messaging'
  | 'Profile'
  | 'System';

export type ScreenMeta = {
  code: string;
  module: ScreenModule;
  title: string;
  description: string;
};

export const SCREENS = {
  // C — Communs, compte & authentification (9)
  'C-01': { code: 'C-01', module: 'Common', title: 'Splash', description: 'Logo, chargement, vérification session, redirection onboarding ou accueil.' },
  'C-02': { code: 'C-02', module: 'Common', title: 'Onboarding', description: 'Bénéfices Achat/Vente, Location, Transport. Skip / Next / Back.' },
  'C-03': { code: 'C-03', module: 'Common', title: 'Choix connexion', description: 'Connexion, créer compte, Google/Apple, téléphone OTP.' },
  'C-04': { code: 'C-04', module: 'Common', title: 'Inscription', description: 'Nom, téléphone, e-mail optionnel, ville, mot de passe/OTP, CGU.' },
  'C-05': { code: 'C-05', module: 'Common', title: 'OTP', description: 'Saisie code, renvoi, expiration, correction téléphone.' },
  'C-06': { code: 'C-06', module: 'Common', title: 'Accueil', description: 'Recherche globale, cartes actions, nouveautés, recommandations IA, billet actif.' },
  'C-07': { code: 'C-07', module: 'Common', title: 'Recherche globale', description: 'Saisie mot-clé, suggestions, recherches récentes, catégories, recherche vocale.' },
  'C-08': { code: 'C-08', module: 'Common', title: 'Recherche visuelle', description: 'Caméra, upload photo, résultats ranked par vision IA.' },
  'C-09': { code: 'C-09', module: 'Common', title: 'Notifications', description: 'Alertes messages, tickets, réservations, annonces, promotions.' },

  // A — Achat & vente automobile (14)
  'A-01': { code: 'A-01', module: 'Marketplace', title: 'Liste voitures à vendre', description: 'Cards véhicules, image, prix, ville, badges, favoris, tri, filtres.' },
  'A-02': { code: 'A-02', module: 'Marketplace', title: 'Filtres achat', description: 'Marque, modèle, prix, année, kilométrage, carburant, transmission, ville, vérification.' },
  'A-03': { code: 'A-03', module: 'Marketplace', title: 'Fiche véhicule', description: 'Galerie, prix, caractéristiques, état, historique, vendeur, contact, comparaison, verdict IA.' },
  'A-04': { code: 'A-04', module: 'Marketplace', title: 'Galerie média', description: 'Photos plein écran, vidéo, zoom, signalement photo, visite 360°.' },
  'A-05': { code: 'A-05', module: 'Marketplace', title: 'Comparer véhicules', description: 'Tableau comparatif de 2 à 4 véhicules avec scores IA.' },
  'A-06': { code: 'A-06', module: 'Marketplace', title: 'Vendre — choix méthode', description: 'Saisie numéro châssis/VIN ou saisie manuelle.' },
  'A-07': { code: 'A-07', module: 'Marketplace', title: 'Vendre — informations véhicule', description: 'Formulaire auto-pré-rempli si VIN reconnu.' },
  'A-08': { code: 'A-08', module: 'Marketplace', title: 'Vendre — état et historique', description: 'Kilométrage, accidents, entretien, assurance, inspection, propriétaire.' },
  'A-09': { code: 'A-09', module: 'Marketplace', title: 'Vendre — prix et localisation', description: 'Prix, estimation Price Oracle, négociable, ville, quartier, disponibilité.' },
  'A-10': { code: 'A-10', module: 'Marketplace', title: 'Vendre — médias', description: 'Upload photos/vidéos, Photo Coach IA, photo principale, ordre.' },
  'A-11': { code: 'A-11', module: 'Marketplace', title: 'Vendre — contact', description: 'Choix appel, WhatsApp, SMS, message in-app, disponibilité horaire.' },
  'A-12': { code: 'A-12', module: 'Marketplace', title: 'Prévisualisation annonce', description: 'Résumé, corrections, publier, statut modération IA puis humaine.' },
  'A-13': { code: 'A-13', module: 'Marketplace', title: 'Mes annonces', description: 'Annonces actives, brouillons, refusées, vendues, statistiques détaillées.' },
  'A-14': { code: 'A-14', module: 'Marketplace', title: 'Alertes marché', description: 'Paramétrage et notifications personnalisées.' },

  // L — Location voiture (9)
  'L-01': { code: 'L-01', module: 'Rental', title: 'Recherche location', description: 'Ville, lieu de retrait, dates, heure, catégorie, bouton rechercher.' },
  'L-02': { code: 'L-02', module: 'Rental', title: 'Liste voitures location', description: 'Disponibilités, prix/jour, prix longue durée, conditions clés.' },
  'L-03': { code: 'L-03', module: 'Rental', title: 'Filtres location', description: 'Prix, dates, transmission, places, caution, assurance, chauffeur, km.' },
  'L-04': { code: 'L-04', module: 'Rental', title: 'Fiche location', description: 'Photos, équipements, tarifs, conditions, documents requis, caution.' },
  'L-05': { code: 'L-05', module: 'Rental', title: 'Options location', description: 'Chauffeur, siège enfant, livraison véhicule, assurance extra, extension km.' },
  'L-06': { code: 'L-06', module: 'Rental', title: 'KYC express', description: 'OCR pièce identité + permis + selfie liveness (90 s).' },
  'L-07': { code: 'L-07', module: 'Rental', title: 'Demande / réservation', description: 'Résumé dates, prix, conditions, identité client, paiement ou demande.' },
  'L-08': { code: 'L-08', module: 'Rental', title: 'Contrat & état des lieux', description: 'Contrat digital signé, photos avant/après horodatées.' },
  'L-09': { code: 'L-09', module: 'Rental', title: 'Mes locations', description: 'En attente, confirmée, en cours, terminée, annulée. Tracking GPS.' },

  // T — Transport urbain & billet (15)
  'T-01': { code: 'T-01', module: 'Transit', title: 'Accueil transport', description: 'Recherche départ/destination/date, trajets récents, billets actifs.' },
  'T-02': { code: 'T-02', module: 'Transit', title: 'Sélection départ', description: 'Recherche ville, commune, arrêt, gare, quartier, GPS, favoris.' },
  'T-03': { code: 'T-03', module: 'Transit', title: 'Sélection destination', description: 'Même logique que départ, suggestions selon départ choisi.' },
  'T-04': { code: 'T-04', module: 'Transit', title: 'Calendrier & heure', description: 'Aujourd\'hui, demain, calendrier, plage horaire, nombre passagers.' },
  'T-05': { code: 'T-05', module: 'Transit', title: 'Résultats horaires', description: 'Liste par compagnie avec prix, durée, places live, conditions, badges.' },
  'T-06': { code: 'T-06', module: 'Transit', title: 'Filtres transport', description: 'Compagnie, prix, heure, durée, direct, services, bagages, note, accessibilité.' },
  'T-07': { code: 'T-07', module: 'Transit', title: 'Détail trajet', description: 'Logo compagnie, trajet, arrêts, conditions, carte, politique annulation.' },
  'T-08': { code: 'T-08', module: 'Transit', title: 'Choix siège / place', description: 'Plan de siège si disponible, lock atomique 10 min.' },
  'T-09': { code: 'T-09', module: 'Transit', title: 'Informations passager', description: 'Nom, téléphone, nombre, catégories tarifaires (adulte, enfant, étudiant).' },
  'T-10': { code: 'T-10', module: 'Transit', title: 'Résumé billet', description: 'Trajet, horaires, prix, frais, conditions, CGV transport, timer panier.' },
  'T-11': { code: 'T-11', module: 'Transit', title: 'Paiement billet', description: 'Bankily, Masrvi, Sedad, Wallety, Kargo Wallet. Statut, reçu.' },
  'T-12': { code: 'T-12', module: 'Transit', title: 'Billet électronique', description: 'QR code haute résolution, logo app, logo compagnie, détails, statut.' },
  'T-13': { code: 'T-13', module: 'Transit', title: 'Mes billets', description: 'Tabs À venir, Actifs, Utilisés, Annulés, Expirés.' },
  'T-14': { code: 'T-14', module: 'Transit', title: 'Détail billet', description: 'QR plein écran (luminosité max), infos, conditions, partager, annuler.' },
  'T-15': { code: 'T-15', module: 'Transit', title: 'Suivi trajet', description: 'Position GPS temps réel, ETA dynamique, retard, notifications. (V2)' },

  // W — Wallet & paiements (8)
  'W-01': { code: 'W-01', module: 'Wallet', title: 'Home wallet', description: 'Solde Kargo, actions rapides (recharger, envoyer, payer, retirer).' },
  'W-02': { code: 'W-02', module: 'Wallet', title: 'Transactions', description: 'Historique filtré, graphiques mensuels, catégorisation IA, export.' },
  'W-03': { code: 'W-03', module: 'Wallet', title: 'Recharge', description: 'Choix source (Bankily, Masrvi, Sedad, carte), montant.' },
  'W-04': { code: 'W-04', module: 'Wallet', title: 'Transfert P2P', description: 'Numéro destinataire, montant, note, biométrie.' },
  'W-05': { code: 'W-05', module: 'Wallet', title: 'Cartes virtuelles', description: 'Génération, gel, suppression, limites.' },
  'W-06': { code: 'W-06', module: 'Wallet', title: 'BNPL', description: 'Plans de paiement fractionné, échéancier, scoring transparent.' },
  'W-07': { code: 'W-07', module: 'Wallet', title: 'Paramètres wallet', description: 'Limites, sécurité, biométrie, PIN, kill switch.' },
  'W-08': { code: 'W-08', module: 'Wallet', title: 'Programme fidélité', description: 'Kargo Points, statuts Bronze/Argent/Or/Platine, catalogue.' },

  // K — Kargo Trust & KYC (6)
  'K-01': { code: 'K-01', module: 'Trust', title: 'Trust profile', description: 'Score, badges, vérifications, historique.' },
  'K-02': { code: 'K-02', module: 'Trust', title: 'KYC flow', description: 'Scan document (MRZ + OCR) + selfie liveness.' },
  'K-03': { code: 'K-03', module: 'Trust', title: 'Vehicle Passport', description: 'Historique véhicule, changements de propriétaire, entretiens.' },
  'K-04': { code: 'K-04', module: 'Trust', title: 'Inspection request', description: 'Demande d\'inspection Kargo Verified (80 points).' },
  'K-05': { code: 'K-05', module: 'Trust', title: 'Litige', description: 'Ouverture, preuves, discussion, médiation, décision, remboursement.' },
  'K-06': { code: 'K-06', module: 'Trust', title: 'Garantie Kargo', description: 'Détails protection, couverture, conditions d\'activation.' },

  // M — Messagerie & notifications (4)
  'M-01': { code: 'M-01', module: 'Messaging', title: 'Chat annonce', description: 'Messagerie WebSocket, typing, read receipts, templates, pièces jointes.' },
  'M-02': { code: 'M-02', module: 'Messaging', title: 'Chat location / trajet', description: 'Contextualisé à la réservation, historique.' },
  'M-03': { code: 'M-03', module: 'Messaging', title: 'Centre notifications', description: 'Liste filtrable par catégorie, archive.' },
  'M-04': { code: 'M-04', module: 'Messaging', title: 'Préférences notifs', description: 'Canaux, fréquences, silent hours, catégories.' },

  // P — Profil & paramètres (9)
  'P-01': { code: 'P-01', module: 'Profile', title: 'Profil', description: 'Photo, nom, téléphone, ville, statut vérifié, menu.' },
  'P-02': { code: 'P-02', module: 'Profile', title: 'Mes favoris', description: 'Annonces, locations, trajets et recherches sauvegardées.' },
  'P-03': { code: 'P-03', module: 'Profile', title: 'Mes paiements', description: 'Historique paiements, reçus, remboursements.' },
  'P-04': { code: 'P-04', module: 'Profile', title: 'Documents', description: 'Pièce identité, permis, documents KYC chiffrés.' },
  'P-05': { code: 'P-05', module: 'Profile', title: 'Paramètres', description: 'Langue (FR/AR/Hassaniya), notifications, confidentialité, canaux.' },
  'P-06': { code: 'P-06', module: 'Profile', title: 'Support', description: 'FAQ, chat support IA puis humain, signalement, ticket.' },
  'P-07': { code: 'P-07', module: 'Profile', title: 'Avis et notes', description: 'Noter vendeur, agence, compagnie transport, trajet.' },
  'P-08': { code: 'P-08', module: 'Profile', title: 'Sécurité & confidentialité', description: 'PIN, biométrie, MFA, export données, suppression.' },
  'P-09': { code: 'P-09', module: 'Profile', title: 'À propos & légal', description: 'CGU, confidentialité, cookies, mentions, version.' },

  // S — États système (4)
  'S-01': { code: 'S-01', module: 'System', title: 'Empty state global', description: 'Aucun résultat / hors ligne, suggestion d\'action.' },
  'S-02': { code: 'S-02', module: 'System', title: 'Error screen', description: 'Erreur serveur, 404, blocage maintenance.' },
  'S-03': { code: 'S-03', module: 'System', title: 'Force update', description: 'Version obsolète, lien vers store, explication.' },
  'S-04': { code: 'S-04', module: 'System', title: 'Maintenance', description: 'Écran temporaire avec ETA de rétablissement.' },
} as const satisfies Record<string, ScreenMeta>;

export type ScreenCode = keyof typeof SCREENS;
