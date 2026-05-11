# Opt-in IndexedDB module

This module is **not** wired up by default. It costs zero bundle bytes until you import it.

## Enable

In `src/main.tsx`, uncomment:

```ts
import './db/client';
```

## Use

```ts
import { db } from '../db/client';

await db.notes.add({ title: 'hi', body: 'world', createdAt: Date.now() });
const all = await db.notes.toArray();
```

## Change the schema

Edit `src/db/schema.ts`. Bump the `version()` number and add a new `.stores({...})` call — Dexie migrates automatically.

## Remove entirely

Delete `src/db/` and remove `dexie` from `package.json`.
