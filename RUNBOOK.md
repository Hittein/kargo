# Kargo — Runbook de déploiement

Procédure pas-à-pas pour passer du repo local à : **backend Render** + **app TestFlight avec OTA**.

---

## 0. État du code

- `backend/` — Spring Boot 3 + Java 17 + Postgres (Dockerfile + entrypoint.sh prêts)
- `mobile/` — Expo SDK 54 + Expo Router + EAS Update
- `admin/` — Next.js 14 (console interne)
- `render.yaml` — blueprint Render (api + admin + db)
- `mobile/app.config.ts` — config dynamique avec OTA + runtimeVersion `appVersion`
- `mobile/eas.json` — profils development / preview / production

L'OTP reste **simulé** côté backend (`OTP_SIMULATE=true`) — code retourné dans la réponse `/auth/start`.

---

## 1. GitHub

```bash
cd ~/kargo
# Vérifie que tu es bien sur main + tout est propre
git status

# Premier commit (déjà préparé, à confirmer avec ton identité)
git commit -m "init: kargo monorepo (mobile + backend + admin + render)"

# Crée le repo sur GitHub (gh ou via UI)
gh repo create Hittein/kargo --private --source=. --remote=origin --push
# OU manuellement :
#   - https://github.com/new → nom: kargo, visibilité: private
#   - git remote add origin git@github.com:Hittein/kargo.git
#   - git push -u origin main
```

---

## 2. Backend sur Render (1ère fois)

1. **Render Dashboard** → New → **Blueprint**
2. Sélectionne le repo `Hittein/kargo` → branche `main`
3. Render lit `render.yaml` automatiquement et propose :
   - Web service `kargo-api` (Docker)
   - Web service `kargo-admin` (Node)
   - Database `kargo-db` (Postgres free)
4. Clique **Apply**. Premier build ≈ 6-10 min (Maven offline cache + Docker layers).
5. Une fois `kargo-api` en ligne (URL : `https://kargo-api.onrender.com`), teste :
   ```bash
   curl https://kargo-api.onrender.com/api/v1/health
   # → {"status":"ok","service":"kargo-api","time":"..."}
   ```

### Variables d'environnement à vérifier dans Render Dashboard

Le `render.yaml` configure déjà :
- `SPRING_PROFILES_ACTIVE=prod`
- `JWT_SECRET` (généré, sync:false en production rotation)
- `DATABASE_URL` (auto-rattaché à `kargo-db`)
- `CORS_ALLOWED_ORIGINS=https://kargo-admin.onrender.com`
- `OTP_SIMULATE=true` (à passer à `false` quand on branchera un SMS gateway)

### Cold start free tier

Le plan free Render endort le service après 15 min d'inactivité. Premier appel = ~15s. Pour la prod, upgrade en plan `starter` ($7/mois).

---

## 3. EAS — initialisation projet

```bash
cd ~/kargo/mobile
npx expo login                    # ton compte Expo (même que Almersoul)
npx eas init --id  # OU: npx eas init et accepte la création
# Note l'EAS project ID retourné (UUID)
```

Mets cet ID dans `app.config.ts` via une variable d'env :

```bash
# Option 1: export local (pour les builds depuis ce poste)
export EAS_PROJECT_ID=<l-uuid>

# Option 2 (recommandée): EAS secret partagé pour tous les builds cloud
npx eas secret:create --scope project --name EAS_PROJECT_ID --value <l-uuid>
```

Vérifie ensuite que `app.config.ts` lit bien la valeur (`updates.url` devient `https://u.expo.dev/<uuid>`).

---

## 4. Premier build TestFlight

### 4.1 Pré-requis Apple

- Apple Developer Program actif
- App Store Connect : crée une **nouvelle app**
  - Plateforme : iOS
  - Nom : Kargo
  - Bundle ID : `com.kargo.client` (créer dans `Certificates, IDs & Profiles` si pas déjà fait)
  - SKU : `kargo-client`

### 4.2 ASC API key (pour `eas submit`)

App Store Connect → Users and Access → Integrations → App Store Connect API → Keys → **+**
- Name: `EAS Kargo`
- Access: `Admin` ou `App Manager`
- Télécharge le `.p8`, note `Key ID` + `Issuer ID`

```bash
# Stocke dans EAS (une fois suffit)
npx eas credentials
# → iOS → production → App Store Connect API key → Set up
```

### 4.3 Build production

```bash
cd ~/kargo/mobile
# Push d'abord les derniers changements
cd .. && git add -A && git commit -m "feat: prepare prod build" && git push
cd mobile

# Build cloud iOS production (≈ 20 min)
npx eas build --platform ios --profile production

# Le binaire .ipa est uploadé sur EAS — l'URL te sera donnée à la fin
```

### 4.4 Soumission TestFlight

```bash
# Soumet le dernier build prod à App Store Connect
npx eas submit --platform ios --profile production --latest
# → traitement Apple ~10-30 min, puis dispo dans TestFlight
```

Ajoute des testeurs internes ou un groupe externe via App Store Connect → TestFlight.

---

## 5. OTA — toutes les mises à jour suivantes

**Tant que tu touches uniquement à `mobile/app/`, `mobile/components/`, `mobile/lib/`, `mobile/i18n/`, `mobile/theme/`, `mobile/assets/`** (et pas à `app.config.ts` natif, ni `package.json` natif, ni Expo SDK), tu publies en OTA :

```bash
cd ~/kargo/mobile
npx eas update --branch production --message "fix: <ce qui change>"
```

L'app TestFlight installée chez les testeurs téléchargera la nouvelle version au prochain lancement. Pas de re-soumission Apple, pas de wait App Review.

### Ce qui force un rebuild + re-soumission

- Bump de `version` dans `app.config.ts` (le runtimeVersion change)
- Ajout/changement d'un plugin Expo natif
- Modification des permissions iOS/Android dans `app.config.ts`
- Bump SDK Expo
- Ajout d'une dépendance avec code natif (`react-native-mmkv` si pas déjà inclus, etc.)

Dans ces cas : `eas build` puis `eas submit` à nouveau.

---

## 6. Backend updates

Push sur `main` → Render redéploie automatiquement (auto-deploy on by default).

⚠ **Règle d'or contrat API** : si tu changes une route ou un payload backend, **déploie d'abord Render**, attends que `/health` revienne OK, **puis** publie l'OTA mobile. Sinon les apps ouvertes pendant le déploiement crashent.

---

## 7. Points critiques

- **`runtimeVersion: appVersion`** : tant que `version: '1.0.0'` reste constant, tous les builds JS sont compatibles. Bump uniquement quand tu introduis du code natif.
- **`appVersionSource: remote`** dans `eas.json` : EAS gère le `buildNumber` iOS automatiquement (`autoIncrement: true`).
- **Channel `production`** : tous les profils EAS (preview + production) écoutent le même channel — le TestFlight et les builds internes reçoivent les mêmes OTA.
- **JWT_SECRET** : généré une seule fois par Render à la création. Rotation = invalidation immédiate de toutes les sessions actives.
- **CORS** : si tu déploies l'admin sur un autre domaine, mets-le à jour dans `CORS_ALLOWED_ORIGINS` côté Render.

---

## 8. Commandes utiles

```bash
# Status build
npx eas build:list --limit 5

# Status update
npx eas update:list --branch production --limit 5

# Logs Render (via dashboard ou CLI)
# https://dashboard.render.com/web/srv-XXX/logs

# Tester l'API en local
cd backend && ./mvnw spring-boot:run
# OTP simulé visible dans les logs ou la réponse JSON

# Tester l'app contre le backend local (LAN)
# mobile/.env.local :
EXPO_PUBLIC_API_URL=http://192.168.X.X:8080/api/v1
```
