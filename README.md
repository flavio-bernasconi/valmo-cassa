# Valmo Cassa 🍟

Valmo Cassa è un'applicazione web per la gestione degli ordini e la stampa automatica di ticket per il ValmoFestival. Progettata per essere usata in postazioni cassa locali, permette di configurare un menu, creare ordini in tempo reale e generare ticket cartacei pronti per la distribuzione agli stand.

## Funzionalità Principali

- **🛒 Interfaccia Ordini**: Schermata intuitiva per selezionare i prodotti dal menu e aggiungerli al carrello.
- **🗳️ Gestione Asporto**: Supporto per marchiare interi ordini o singoli prodotti come "ASPORTO" (Takeout).
- **🖨️ Stampa Termica Automatica**: Integrazione diretta con stampanti termiche (standard ESC/POS).
- **📦 Ticket Intelligenti**: Possibilità di stampare ticket singoli per ogni prodotto o raggruppati per tipologia (es. Bar, Cucina).
- **☁️ Supabase Integration**: Sincronizzazione in tempo reale di menu e ordini sul database cloud.

## Configurazione Locale

Per far girare il progetto in locale, segui questi passaggi:

### 1. Prerequisiti

- **Stampante Termica**: Una stampante compatibile ESC/POS (es. Epson, XPrinter) collegata via USB. Il percorso predefinito in Mac/Linux è `/dev/usb/lp0`. Puoi cambiare questa configurazione in `lib/printer.ts`.
- **Database Supabase**: Un progetto Supabase attivo con le seguenti tabelle:
  - `menu_2026`: Contiene i prodotti (id, name, price, type).
  - `orders_2026`: Registra gli ordini (id, user_id, total_price, created_at).
  - `order_items_2026`: Dettagli dei prodotti per ogni ordine.

### 2. Installazione delle dipendenze

Clona il repository e installa i pacchetti necessari:

```bash
npm install
```

### 3. Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto e aggiungi le tue credenziali Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tuo-url-progetto
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tua-chiave-pubblica
```

### 4. Avvio del server di sviluppo

Lancia il progetto in modalità sviluppo:

```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000). Accedi per iniziare a gestire gli ordini.

## Tecnologie Utilizzate

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Stampa**: [node-thermal-printer](https://github.com/Klemen1337/node-thermal-printer)
