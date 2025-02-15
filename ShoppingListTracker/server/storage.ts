import { ShoppingItem } from "@shared/schema";

export interface IStorage {
  // No storage methods needed as we're keeping everything in frontend state
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
