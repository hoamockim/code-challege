export type SortOrder = "asc" | "desc";

export type CategoryProps = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CategoryDirtyField =
  | "name"
  | "description"
  | "updatedAt"
  | "deletedAt";

export type CategoryDirtyChanges = Partial<
  Pick<CategoryProps, CategoryDirtyField>
>;

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string | null;
};

export type CategoryListFilters = {
  search?: string;
  sortBy: CategorySortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
};

export type CategorySortBy = "createdAt" | "updatedAt" | "name";

export type PaginatedCategories = {
  items: Category[];
  total: number;
  page: number;
  limit: number;
};

export class Category {
  readonly id: string;
  name: string;
  description: string | null;
  readonly createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  private readonly dirty = new Set<CategoryDirtyField>();
  private newEntity: boolean;

  private constructor(props: CategoryProps, isNew = false) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
    this.newEntity = isNew;
  }

  static create(
    input: CreateCategoryInput,
    idFactory: () => string = () => crypto.randomUUID()
  ): Category {
    const now = new Date();
    return new Category(
      {
        id: idFactory(),
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      true
    );
  }

  static restore(props: CategoryProps): Category {
    return new Category(props, false);
  }

  isNew(): boolean {
    return this.newEntity;
  }

  markPersisted(): void {
    this.newEntity = false;
    this.clearDirty();
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  hasDirtyChanges(): boolean {
    return this.dirty.size > 0;
  }

  getDirtyChanges(): CategoryDirtyChanges {
    const changes: CategoryDirtyChanges = {};
    for (const field of this.dirty) {
      changes[field] = this[field] as never;
    }
    return changes;
  }

  clearDirty(): void {
    this.dirty.clear();
  }

  applyUpdate(input: UpdateCategoryInput): void {
    let changed = false;

    if (input.name !== undefined) {
      changed = this.setField("name", input.name) || changed;
    }
    if (input.description !== undefined) {
      changed = this.setField("description", input.description) || changed;
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

  private setField<K extends CategoryDirtyField>(
    field: K,
    value: CategoryProps[K]
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
