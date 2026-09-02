/**
 * OsterdOps — High-Performance In-Memory Firestore Engine
 * Used for local development, CI/CD, and fast offline prototyping when
 * Google Cloud Service Account credentials are not configured in .env.local.
 *
 * Eliminates the 25-30 second Google Cloud ADC metadata server socket timeout.
 */

export interface InMemoryDocData {
  id: string;
  [key: string]: any;
}

export class InMemoryDocumentSnapshot {
  constructor(
    public readonly id: string,
    private readonly _data: InMemoryDocData | null,
    public readonly ref: InMemoryDocumentReference
  ) {}

  get exists(): boolean {
    return this._data !== null && this._data !== undefined;
  }

  data(): any {
    if (!this._data) return undefined;
    const { id: _, ...rest } = this._data;
    return { ...rest };
  }
}

export class InMemoryQuerySnapshot {
  constructor(public readonly docs: InMemoryDocumentSnapshot[]) {}

  get empty(): boolean {
    return this.docs.length === 0;
  }

  get size(): number {
    return this.docs.length;
  }

  forEach(callback: (doc: InMemoryDocumentSnapshot) => void): void {
    this.docs.forEach(callback);
  }

  map<T>(callback: (doc: InMemoryDocumentSnapshot) => T): T[] {
    return this.docs.map(callback);
  }
}

export class InMemoryQuery {
  protected _filters: Array<{ field: string; op: string; val: any }> = [];
  protected _orderBys: Array<{ field: string; dir: "asc" | "desc" }> = [];
  protected _limitNum?: number;
  protected _offsetNum?: number;

  constructor(protected readonly _fetchDocs: () => InMemoryDocumentSnapshot[]) {}

  where(field: string, op: string, val: any): InMemoryQuery {
    const q = new InMemoryQuery(this._fetchDocs);
    q._filters = [...this._filters, { field, op, val }];
    q._orderBys = [...this._orderBys];
    q._limitNum = this._limitNum;
    q._offsetNum = this._offsetNum;
    return q;
  }

  orderBy(field: string, dir: "asc" | "desc" = "asc"): InMemoryQuery {
    const q = new InMemoryQuery(this._fetchDocs);
    q._filters = [...this._filters];
    q._orderBys = [...this._orderBys, { field, dir }];
    q._limitNum = this._limitNum;
    q._offsetNum = this._offsetNum;
    return q;
  }

  limit(n: number): InMemoryQuery {
    const q = new InMemoryQuery(this._fetchDocs);
    q._filters = [...this._filters];
    q._orderBys = [...this._orderBys];
    q._limitNum = n;
    q._offsetNum = this._offsetNum;
    return q;
  }

  offset(n: number): InMemoryQuery {
    const q = new InMemoryQuery(this._fetchDocs);
    q._filters = [...this._filters];
    q._orderBys = [...this._orderBys];
    q._limitNum = this._limitNum;
    q._offsetNum = n;
    return q;
  }

  async get(): Promise<InMemoryQuerySnapshot> {
    let docs = this._fetchDocs().filter((d) => d.exists);

    for (const f of this._filters) {
      docs = docs.filter((d) => {
        const val = (d.data() || {})[f.field];
        switch (f.op) {
          case "==":
            return val === f.val;
          case "!=":
            return val !== f.val;
          case "<":
            return val < f.val;
          case "<=":
            return val <= f.val;
          case ">":
            return val > f.val;
          case ">=":
            return val >= f.val;
          case "in":
            return Array.isArray(f.val) && f.val.includes(val);
          case "array-contains":
            return Array.isArray(val) && val.includes(f.val);
          default:
            return true;
        }
      });
    }

    for (const ob of this._orderBys) {
      docs.sort((a, b) => {
        const valA = (a.data() || {})[ob.field];
        const valB = (b.data() || {})[ob.field];
        if (valA === valB) return 0;
        const res = valA > valB ? 1 : -1;
        return ob.dir === "desc" ? -res : res;
      });
    }

    if (this._offsetNum && this._offsetNum > 0) {
      docs = docs.slice(this._offsetNum);
    }
    if (this._limitNum !== undefined && this._limitNum >= 0) {
      docs = docs.slice(0, this._limitNum);
    }

    return new InMemoryQuerySnapshot(docs);
  }
}

export class InMemoryCollectionReference extends InMemoryQuery {
  constructor(
    public readonly id: string,
    public readonly path: string,
    private readonly _store: InMemoryFirestore
  ) {
    super(() => _store.getDocsInPath(path));
  }

  doc(docId?: string): InMemoryDocumentReference {
    const id = docId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fullPath = `${this.path}/${id}`;
    return new InMemoryDocumentReference(id, fullPath, this._store, this);
  }

  async add(data: any): Promise<InMemoryDocumentReference> {
    const d = this.doc();
    await d.set(data);
    return d;
  }
}

export class InMemoryDocumentReference {
  constructor(
    public readonly id: string,
    public readonly path: string,
    private readonly _store: InMemoryFirestore,
    public readonly parent?: InMemoryCollectionReference
  ) {}

  collection(subCollectionName: string): InMemoryCollectionReference {
    const subPath = `${this.path}/${subCollectionName}`;
    return new InMemoryCollectionReference(subCollectionName, subPath, this._store);
  }

  async get(): Promise<InMemoryDocumentSnapshot> {
    const record = this._store.getData(this.path);
    return new InMemoryDocumentSnapshot(this.id, record, this);
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    const now = new Date().toISOString();
    const cleanData = sanitizeData(data, now);
    if (options?.merge) {
      const existing = this._store.getData(this.path) || { id: this.id };
      this._store.setData(this.path, { ...existing, ...cleanData, id: this.id });
    } else {
      this._store.setData(this.path, { ...cleanData, id: this.id });
    }
  }

  async update(data: any): Promise<void> {
    const existing = this._store.getData(this.path);
    if (!existing) {
      const err = new Error(`No document to update: ${this.path}`);
      (err as any).code = 5; // NOT_FOUND
      throw err;
    }
    const now = new Date().toISOString();
    const cleanData = sanitizeData(data, now);
    this._store.setData(this.path, { ...existing, ...cleanData, id: this.id });
  }

  async delete(): Promise<void> {
    this._store.deleteData(this.path);
  }
}

function sanitizeData(obj: any, now: string): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "object" && obj.constructor?.name === "FieldValue") {
    return now;
  }
  if (typeof obj === "object" && "_methodName" in obj) {
    return now;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeData(item, now));
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k] = sanitizeData(v, now);
    }
    return clean;
  }
  return obj;
}

export class InMemoryBatch {
  private _ops: Array<() => void> = [];

  set(ref: InMemoryDocumentReference, data: any, options?: { merge?: boolean }): InMemoryBatch {
    this._ops.push(() => ref.set(data, options));
    return this;
  }

  update(ref: InMemoryDocumentReference, data: any): InMemoryBatch {
    this._ops.push(() => ref.update(data));
    return this;
  }

  delete(ref: InMemoryDocumentReference): InMemoryBatch {
    this._ops.push(() => ref.delete());
    return this;
  }

  async commit(): Promise<void> {
    for (const op of this._ops) {
      await op();
    }
    this._ops = [];
  }
}

export class InMemoryFirestore {
  private _storage = new Map<string, InMemoryDocData>();

  getData(fullPath: string): InMemoryDocData | null {
    return this._storage.get(fullPath) || null;
  }

  setData(fullPath: string, data: InMemoryDocData): void {
    this._storage.set(fullPath, data);
  }

  deleteData(fullPath: string): void {
    this._storage.delete(fullPath);
  }

  getDocsInPath(collectionPath: string): InMemoryDocumentSnapshot[] {
    const docs: InMemoryDocumentSnapshot[] = [];
    const prefix = `${collectionPath}/`;

    for (const [key, val] of this._storage.entries()) {
      if (key.startsWith(prefix)) {
        const sub = key.slice(prefix.length);
        if (!sub.includes("/")) {
          const docRef = new InMemoryDocumentReference(sub, key, this);
          docs.push(new InMemoryDocumentSnapshot(sub, val, docRef));
        }
      }
    }
    return docs;
  }

  collection(collectionName: string): InMemoryCollectionReference {
    return new InMemoryCollectionReference(collectionName, collectionName, this);
  }

  collectionGroup(collectionName: string): InMemoryQuery {
    return new InMemoryQuery(() => {
      const docs: InMemoryDocumentSnapshot[] = [];
      const matchSlash = `/${collectionName}/`;

      for (const [key, val] of this._storage.entries()) {
        if (key.startsWith(`${collectionName}/`) || key.includes(matchSlash)) {
          const parts = key.split("/");
          const idx = parts.lastIndexOf(collectionName);
          if (idx !== -1 && idx === parts.length - 2) {
            const docId = parts[parts.length - 1];
            const docRef = new InMemoryDocumentReference(docId, key, this);
            docs.push(new InMemoryDocumentSnapshot(docId, val, docRef));
          }
        }
      }
      return docs;
    });
  }

  batch(): InMemoryBatch {
    return new InMemoryBatch();
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const tx = {
      get: (ref: InMemoryDocumentReference) => ref.get(),
      set: (ref: InMemoryDocumentReference, data: any, options?: any) => ref.set(data, options),
      update: (ref: InMemoryDocumentReference, data: any) => ref.update(data),
      delete: (ref: InMemoryDocumentReference) => ref.delete(),
    };
    return await updateFunction(tx);
  }
}

// Global Singleton for in-memory development store
const globalForStore = globalThis as unknown as { inMemoryDb?: InMemoryFirestore };
export const inMemoryDb = globalForStore.inMemoryDb || new InMemoryFirestore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.inMemoryDb = inMemoryDb;
}
