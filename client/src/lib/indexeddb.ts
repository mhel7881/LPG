// IndexedDB utility functions for offline storage

const DB_NAME = "GasFlowDB";
const DB_VERSION = 1;

interface DBStore {
  name: string;
  keyPath: string;
}

const stores: DBStore[] = [
  { name: "cart", keyPath: "userId" },
  { name: "products", keyPath: "id" },
  { name: "orders", keyPath: "id" },
  { name: "user_data", keyPath: "userId" },
];

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      stores.forEach(store => {
        if (!database.objectStoreNames.contains(store.name)) {
          database.createObjectStore(store.name, { keyPath: store.keyPath });
        }
      });
    };
  });
};

export const saveToIndexedDB = async (storeName: string, key: string, data: any): Promise<void> => {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const putData = { ...data };
    (putData as any)[store.keyPath as string] = key;
    const request = store.put(putData);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save to ${storeName}`));
  });
};

export const getFromIndexedDB = async (storeName: string, key: string): Promise<any> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get from ${storeName}`));
  });
};

export const deleteFromIndexedDB = async (storeName: string, key: string): Promise<void> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete from ${storeName}`));
  });
};

export const getAllFromIndexedDB = async (storeName: string): Promise<any[]> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get all from ${storeName}`));
  });
};

export const clearIndexedDBStore = async (storeName: string): Promise<void> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
  });
};
