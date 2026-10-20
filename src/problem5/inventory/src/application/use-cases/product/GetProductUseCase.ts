import { NotFoundError } from "../../../domain/errors/AppError";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";
import { ProductResponseDto } from "../../dtos/ProductDto";
import { ProductMapper } from "../../mappers/ProductMapper";

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<ProductResponseDto> {
    const hydrated = await this.productRepository.findById(id);
    if (!hydrated) {
      throw new NotFoundError("Product not found");
    }
    return ProductMapper.toDto(hydrated);
  }
}
