import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";
import {
  ProductResponseDto,
  UpdateProductRequestDto,
} from "../../dtos/ProductDto";
import { ProductMapper } from "../../mappers/ProductMapper";

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(
    id: string,
    input: UpdateProductRequestDto
  ): Promise<ProductResponseDto> {
    const hasFields = Object.values(input).some((value) => value !== undefined);
    if (!hasFields) {
      throw new ValidationError("At least one field is required");
    }

    const hydrated = await this.productRepository.findById(id);
    if (!hydrated) {
      throw new NotFoundError("Product not found");
    }

    const { product } = hydrated;
    let category = hydrated.category;

    if (input.sku !== undefined) {
      const skuOwner = await this.productRepository.findBySku(input.sku.trim());
      if (skuOwner && skuOwner.id !== id) {
        throw new ConflictError("SKU already exists");
      }
    }

    if (input.categoryId !== undefined) {
      const nextCategory = await this.categoryRepository.findById(
        input.categoryId
      );
      if (!nextCategory) {
        throw new NotFoundError("Category not found");
      }
      category = { id: nextCategory.id, name: nextCategory.name };
    }

    product.applyUpdate({
      sku: input.sku?.trim(),
      name: input.name?.trim(),
      description: input.description,
      categoryId: input.categoryId,
      priceCents: input.priceCents,
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold,
    });

    const saved = await this.productRepository.save(product);
    return ProductMapper.toDtoWithCategory(saved, category);
  }
}
