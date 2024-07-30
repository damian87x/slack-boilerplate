import { Low, Memory } from 'lowdb';

// TODO: add file support 
const file = 'tmp/db.json';
const db = new Low(new Memory(), { interceptors: [] });

export const initializeDB = async (data) => {
  await db.read();
  db.data = db.data || data;
  await db.write();
};

export const readDB = async () => {
  await db.read();
  return db.data;
};

export const writeDB = async () => {
  await db.write();
};

export default db;
