import { Request, Response } from "express";
import { CreateProductUseCase } from "../../../application/use-cases/product/CreateProductUseCase";
import { DeleteProductUseCase } from "../../../application/use-cases/product/DeleteProductUseCase";
import { GetProductUseCase } from "../../../application/use-cases/product/GetProductUseCase";
import { ListProductsUseCase } from "../../../application/use-cases/product/ListProductsUseCase";
import { UpdateProductUseCase } from "../../../application/use-cases/product/UpdateProductUseCase";
import { ValidationError } from "../../../domain/errors/AppError";
import { http } from "../../../shared/http";
import {
  createProductSchema,
  listProductsSchema,
  productIdParamSchema,
  updateProductSchema,
} from "../validators/productValidators";

export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listProductsSchema.safeParse(req.query);
    if (!query.success) {
      throw new ValidationError(
        query.error.issues[0]?.message ?? "Invalid query parameters"
      );
    }

    const result = await this.listProductsUseCase.execute(query.data);
    res.status(http.OK).json(result);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const params = productIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid product id"
      );
    }

    const product = await this.getProductUseCase.execute(params.data.id);
    res.status(http.OK).json({ success: true, data: product });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createProductSchema.safeParse(req.body);
    if (!body.success) {
      throw new ValidationError(
        body.error.issues[0]?.message ?? "Invalid request body"
      );
    }

    const product = await this.createProductUseCase.execute(body.data);
    res
      .status(http.CREATED)
      .location(`/api/products/${product.id}`)
      .json({ success: true, data: product });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const params = productIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid product id"
      );
    }

    const body = updateProductSchema.safeParse(req.body);
    if (!body.success) {
      throw new ValidationError(
        body.error.issues[0]?.message ?? "Invalid request body"
      );
    }

    const product = await this.updateProductUseCase.execute(
      params.data.id,
      body.data
    );
    res.status(http.OK).json({ success: true, data: product });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const params = productIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid product id"
      );
    }

    await this.deleteProductUseCase.execute(params.data.id);
    res.status(http.NO_CONTENT).send();
  };
}
