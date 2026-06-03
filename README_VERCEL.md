s# Déploiement sur Vercel — Domino 2026

Ce fichier explique comment déployer l'application Next.js sur Vercel et quelles variables d'environnement sont nécessaires.

## Pré-requis
- Compte Vercel (https://vercel.com)
- Repository Git (GitHub, GitLab ou Bitbucket) connecté à Vercel
- Variables d'environnement Supabase (voir plus bas)

## Variables d'environnement recommandées
Ajoutez ces variables dans le panneau **Settings → Environment Variables** du projet Vercel.

- NEXT_PUBLIC_SUPABASE_URL — URL publique de votre instance Supabase
- NEXT_PUBLIC_SUPABASE_ANON_KEY — clé publique (anon) Supabase

(Optionnel - pour actions serveurs / admin)
- SUPABASE_SERVICE_KEY — clé de service (si vous utilisez côté serveur des opérations sensibles)

Note: `lib/supabaseClient.ts` utilise `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Commandes de build
Vercel détecte automatiquement un projet Next.js. Les scripts dans `package.json` sont déjà:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`

Vercel utilisera `npm run build`. Pas d'autres changements nécessaires normalement.

## Recommandations PWA / Mobile
- Le manifeste web (`/public/manifest.json`) et les meta tags sont déjà ajoutés pour permettre un affichage en mode "standalone".
 - Le manifeste web (`/public/manifest.json`) et les meta tags sont déjà ajoutés pour permettre un affichage en mode "standalone".
 - Pour une meilleure compatibilité Android/iOS, ajoutez des icônes PNG (192x192, 512x512) dans `public/`.
	 - Nom recommandé: `icon-192x192.png` et `icon-512x512.png`.
	 - Si vous avez une seule image (ex: `app-icon.png`), vous pouvez générer les tailles avec ImageMagick ou un outil en ligne.
		 Exemple (PowerShell + ImageMagick installé) :

```powershell
magick convert path\to\app-icon.png -resize 192x192 public\icon-192x192.png
magick convert path\to\app-icon.png -resize 512x512 public\icon-512x512.png
```

	 - Après avoir placé ces fichiers, le manifeste (`public/manifest.json`) et les meta tags sont déjà configurés pour les utiliser.

## Configuration du domaine (optionnel)
- Vous pouvez ajouter un domaine personnalisé dans Vercel et configurer le DNS.

## Débogage
- Voir les logs de build et d'exécution dans l'interface Vercel.
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont correctement renseignées.

## Étapes rapides
1. Pousser le repo sur GitHub.
2. Créer un nouveau projet sur Vercel et connecter le repo.
3. Définir les variables d'environnement listées ci-dessus.
4. Lancer le déploiement.

---

Si vous voulez, je peux:
- Générer des icônes PNG 192×192 et 512×512 et les ajouter dans `public/`.
- Créer un petit script de build ou GitHub Action pour déploiement continu (CI).

Dites-moi ce que vous préférez et je l'ajoute.
