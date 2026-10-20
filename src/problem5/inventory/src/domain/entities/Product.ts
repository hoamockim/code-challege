export type SortOrder = "asc" | "desc";

export type ProductProps = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/** Persistable fields that can be patched by save(). */
export type ProductDirtyField =
  | "sku"
  | "name"
  | "description"
  | "categoryId"
  | "priceCents"
  | "stockQuantity"
  | "lowStockThreshold"
  | "updatedAt"
  | "deletedAt";

export type ProductDirtyChanges = Partial<
  Pick<ProductProps, ProductDirtyField>
>;

export type CreateProductInput = {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
};

export type UpdateProductInput = {
  sku?: string;
  name?: string;
  description?: string | null;
  categoryId?: string;
  priceCents?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
};

/**
 * Filter fields for listing products.
 * All filters are optional and combined with AND.
 */
export type ProductListFilters = {
  /** Filter by category UUID */
  categoryId?: string;
  /** Case-insensitive partial match on SKU */
  sku?: string;
  /** Case-insensitive partial match on name */
  name?: string;
  /** Case-insensitive search across name OR sku */
  search?: string;
  /** true = stockQuantity <= lowStockThreshold; false = above threshold */
  lowStock?: boolean;
  /** Inclusive minimum price in cents */
  minPriceCents?: number;
  /** Inclusive maximum price in cents */
  maxPriceCents?: number;
  /** Inclusive minimum stock quantity */
  minStockQuantity?: number;
  /** Inclusive maximum stock quantity */
  maxStockQuantity?: number;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
};

export type ProductSortBy =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "sku"
  | "priceCents"
  | "stockQuantity"
  | "categoryId";

export type ProductCategoryRef = {
  id: string;
  name: string;
};

/** Product loaded with its category for API responses. */
export type HydratedProduct = {
  product: Product;
  category: ProductCategoryRef;
};

export type PaginatedProducts = {
  items: HydratedProduct[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Rich domain entity with dirty tracking.
 * - Create: Product.create(input) → repository.save(product)  (INSERT)
 * - Update/Delete: find → mutate → repository.save(product)   (patch UPDATE)
 */
export class Product {
  readonly id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  readonly createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  private readonly dirty = new Set<ProductDirtyField>();
  private newEntity: boolean;

  private constructor(props: ProductProps, isNew = false) {
    this.id = props.id;
    this.sku = props.sku;
    this.name = props.name;
    this.description = props.description;
    this.categoryId = props.categoryId;
    this.priceCents = props.priceCents;
    this.stockQuantity = props.stockQuantity;
    this.lowStockThreshold = props.lowStockThreshold;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
    this.newEntity = isNew;
  }

  /** Create a new product entity (not yet persisted). */
  static create(
    input: CreateProductInput,
    idFactory: () => string = () => crypto.randomUUID()
  ): Product {
    const now = new Date();
    return new Product(
      {
        id: idFactory(),
        sku: input.sku,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId,
        priceCents: input.priceCents,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      true
    );
  }

  /** Rebuild an entity from persistence (or tests). Starts clean (no dirty fields). */
  static restore(props: ProductProps): Product {
    return new Product(props, false);
  }

  isNew(): boolean {
    return this.newEntity;
  }

  /** Called by repository after a successful INSERT. */
  markPersisted(): void {
    this.newEntity = false;
    this.clearDirty();
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isLowStock(): boolean {
    return this.stockQuantity <= this.lowStockThreshold;
  }

  hasDirtyChanges(): boolean {
    return this.dirty.size > 0;
  }

  getDirtyChanges(): ProductDirtyChanges {
    const changes: ProductDirtyChanges = {};
    for (const field of this.dirty) {
      changes[field] = this[field] as never;
    }
    return changes;
  }

  clearDirty(): void {
    this.dirty.clear();
  }

  applyUpdate(input: UpdateProductInput): void {
    let changed = false;

    if (input.sku !== undefined) {
      changed = this.setField("sku", input.sku) || changed;
    }
    if (input.name !== undefined) {
      changed = this.setField("name", input.name) || changed;
    }
    if (input.description !== undefined) {
      changed = this.setField("description", input.description) || changed;
    }
    if (input.categoryId !== undefined) {
      changed = this.setField("categoryId", input.categoryId) || changed;
    }
    if (input.priceCents !== undefined) {
      changed = this.setField("priceCents", input.priceCents) || changed;
    }
    if (input.stockQuantity !== undefined) {
      changed = this.setField("stockQuantity", input.stockQuantity) || changed;
    }
    if (input.lowStockThreshold !== undefined) {
      changed =
        this.setField("lowStockThreshold", input.lowStockThreshold) || changed;
    }

    if (changed) {
      this.touch();
    }
  }

  softDelete(): void {
    if (this.isDeleted) {
      return;
    }
    const now = new Date();
    this.setField("deletedAt", now);
    this.setField("updatedAt", now);
  }

  private setField<K extends ProductDirtyField>(
    field: K,
    value: ProductProps[K]
  ): boolean {
    if (this.valuesEqual(this[field], value)) {
      return false;
    }
    Object.assign(this, { [field]: value });
    this.dirty.add(field);
    return true;
  }

  private valuesEqual(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    return a === b;
  }

  private touch(): void {
    this.setField("updatedAt", new Date());
  }
}
