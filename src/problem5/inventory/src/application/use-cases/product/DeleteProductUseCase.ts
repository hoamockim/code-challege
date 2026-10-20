import { NotFoundError } from "../../../domain/errors/AppError";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const hydrated = await this.productRepository.findById(id);
    if (!hydrated) {
      throw new NotFoundError("Product not found");
    }

    hydrated.product.softDelete();
    await this.productRepository.save(hydrated.product);
  }
}
