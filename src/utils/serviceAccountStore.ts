const store = new Map<string, string>();

export const ServiceAccountStore = {
  set(userId: string, serviceAccountJson: string): void {
    store.set(userId, serviceAccountJson);
  },

  get(userId: string): string | undefined {
    return store.get(userId);
  },

  has(userId: string): boolean {
    return store.has(userId);
  },

  remove(userId: string): void {
    store.delete(userId);
  },
};
