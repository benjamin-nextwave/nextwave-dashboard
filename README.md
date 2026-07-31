# Schema

Persoonlijk indelingsschema. Eén dag per scherm, van opstaan tot bedtijd,
met weekdoelen per onderwerp en een terugblik op de no-go's van gisteren.
Gebouwd voor de telefoon.

## In gebruik nemen

### 1. Database opzetten

Open in Supabase het **SQL Editor**-tabblad, plak de inhoud van
`supabase/001_reset.sql` en voer hem uit.

> **Let op:** het eerste deel van dat bestand verwijdert de tabellen van het
> oude dashboard (taken, bedrijven, berichten, vragen). Dat is onomkeerbaar.
> Wil je die data bewaren, verwijder dan eerst de `drop table`-regels.

### 2. Omgevingsvariabelen

Drie waarden, zowel lokaal in `.env.local` als in Vercel onder
**Settings → Environment Variables**:

| Variabele | Waar vandaan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `APP_PIN` | Verzin zelf een pincode, bijvoorbeeld `4821` |

De service-role-sleutel mag **nooit** in een variabele die met
`NEXT_PUBLIC_` begint: die worden meegestuurd naar de browser.

### 3. Op je telefoon zetten

Open de app in Chrome op Android → menu → **App installeren**. Hij komt
dan als los icoon op je beginscherm, zonder adresbalk. De pincode hoef je
maar één keer in te voeren.

## Hoe het werkt

**De dag.** De tijdlijn loopt van je opstaanstijd tot je bedtijd. Blokken
staan op volgorde, gaten ertussen zijn tikbaar — daar plan je iets in. De
lade bovenaan bevat wat nog geen plek heeft; elke dag staat het vaste
werkblok daar automatisch klaar.

**Gehaald versus ingepland.** Elk blok heeft een vinkje. De weekmeters
tonen beide: de volle balk is wat je afgevinkt hebt, de doorschijnende
staart erachter is wat er nog staat te gebeuren.

**De no-go's.** Onder het schema van vandaag staat de checklist van
*gisteren*. Bewust achteraf: op de dag zelf kan het nog misgaan.
"Kamer opgeruimd" verschijnt alleen op dagen waarop je daar een blok voor
had ingepland.

**Notities.** Per blok in het invulpaneel, en per dag onderaan het scherm.

De weekdoelen en je dagritme pas je aan onder **Instellingen**. Ze staan
in de database, niet in de code.

## Techniek

Next.js 16 (App Router), React 19, Tailwind 4, Supabase.

Alle databasetoegang loopt server-side via server actions met de
service-role-sleutel. De tabellen hebben RLS aan zonder policies, dus de
publieke anon-key komt er niet in. De pincode zit in een `httpOnly`-cookie
en wordt gecontroleerd in `src/proxy.ts`.

```
src/
  app/          pagina's: vandaag, /dag/[datum], /week, /instellingen, /login
  components/   tijdlijn, invulpaneel, meters, no-go-checklist
  lib/          data.ts (lezen), actions.ts (schrijven), time.ts (dagrekenen)
supabase/       001_reset.sql
```

De dag rolt om 04:00 om, niet om middernacht — een blok van 01:00 hoort
nog bij de dag ervoor.

```bash
npm run dev     # http://localhost:3000
npm run build
```
