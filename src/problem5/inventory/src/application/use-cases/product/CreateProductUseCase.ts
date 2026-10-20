import { Product } from "../../../domain/entities/Product";
import { ConflictError, NotFoundError } from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";
import {
  CreateProductRequestDto,
  ProductResponseDto,
} from "../../dtos/ProductDto";
import { ProductMapper } from "../../mappers/ProductMapper";

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(input: CreateProductRequestDto): Promise<ProductResponseDto> {
    const sku = input.sku.trim();
    const existing = await this.productRepository.findBySku(sku);
    if (existing) {
      throw new ConflictError("SKU already exists");
    }

    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const product = Product.create({
      sku,
      name: input.name.trim(),
      description: input.description ?? null,
      categoryId: category.id,
      priceCents: input.priceCents,
      stockQuantity: input.stockQuantity ?? 0,
      lowStockThreshold: input.lowStockThreshold ?? 5,
    });

    const saved = await this.productRepository.save(product);
    return ProductMapper.toDtoWithCategory(saved, {
      id: category.id,
      name: category.name,
    });
  }
}
