import Dexie, { type EntityTable } from 'dexie';

export type Note = {
  id?: number;
  title: string;
  body: string;
  createdAt: number;
};

export type AppDB = Dexie & {
  notes: EntityTable<Note, 'id'>;
};

export function createDB(): AppDB {
  const db = new Dexie('mockingbird') as AppDB;
  db.version(1).stores({
    notes: '++id, createdAt',
  });
  return db;
}
