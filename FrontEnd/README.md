# TDI (Tanár-Diák-Interface) - FrontEnd

A TDI webes felülete Vue 3, Vite, Composition API (`<script setup>`), Pinia és Vue Router alapokon épült fel. A design hűen követi az eredeti landing page vizuális arculatát (Inter betűtípus, korall akcentus szín, lekerekített kártyák, glassmorphism elemek).

## Főbb funkciók és szerepkörök

### 1. Publikus funkciók
- **Landing Page**: Interaktív nyitóoldal hero szekcióval, bemutató kártyákkal, gyors órakereső és foglaló dobozzal.
- **Egységes Bejelentkezés (`/login`)**: Egyetlen űrlap mindhárom szerepkörhöz (diák és tanár e-mail címmel, adminisztrátor felhasználónévvel).
- **Diák Regisztráció (`/register`)**: Felhasználónév, e-mail és jelszó validációval.

### 2. Diák funkciók (`/student`)
- Szabad időpontok böngészése és keresése külön tantárgyra és tanárra.
- Óra lefoglalása (az óra függőben lévő állapotba kerül).
- Saját foglalások listázása állapotjelzőkkel (függőben, jóváhagyva, lemondva).
- Foglalás lemondása megerősítéssel (a tanár értesítést kap).
- Rendszerértesítések megtekintése és olvasottnak jelölése.
- Saját profil inaktiválása (soft delete) megerősítő ablakkal és automatikus kijelentkeztetéssel.

### 3. Tanár funkciók (`/teacher`)
- Új szabad óra / időpont meghirdetése (tantárgy, dátum, idő).
- Saját órák és jelentkezések áttekintése (foglaló diák neve és e-mail címe).
- Diák foglalásának jóváhagyása (a diák értesítést kap).
- Óra lemondása (a foglaló diák értesítést kap).
- Részletes statisztikai kimutatás (meghirdetett, szabad, függő, jóváhagyott, lemondott órák száma).
- Értesítések kezelése.

### 4. Adminisztrátor funkciók (`/admin`)
- Rendszer áttekintés és tanári fiók létrehozása űrlap.
- Tanárok és diákok listázása (inaktív felhasználók szűrési lehetőségével).
- Tanár és diák inaktiválása (soft delete) megerősítő ablakkal.
- Kiválasztott tanár vagy diák részletes adatlapja (óraszámok, statisztikák, kapcsolódó órák).
- Összes foglalt és jóváhagyott óra áttekintése.

---

## Telepítés és Indítás

### Követelmények
- Node.js (v18+)
- npm (v9+)
- Futó TDI Backend (`http://localhost:5000`)

### 1. Függőségek telepítése
A `FrontEnd` mappában futtasd:
```bash
npm install
```

### 2. Környezeti változók (.env)
A projekt gyökerében található egy `.env.example` és `.env` fájl:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Fejlesztői szerver indítása
```bash
npm run dev
```
Az alkalmazás elérhető a böngészőben: `http://localhost:5173`

### 4. Éles build készítése
```bash
npm run build
```
A statikus fájlok a `dist/` mappába kerülnek.

---

## Teszt Felhasználók (Backend Seed Adatok)

| Szerepkör | Azonosító (Login) | Jelszó |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin` |
| **Tanár** | `kovacs.istvan@example.com` | `password123` |
| **Tanár** | `toth.erzsebet@example.com` | `password123` |
| **Tanár** | `horvath.peter@example.com` | `password123` |
| **Diák** | `nagy.anna@example.com` | `password123` |
| **Diák** | `szabo.bence@example.com` | `password123` |
