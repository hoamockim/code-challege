import { Request, Response } from "express";
import { CreateCategoryUseCase } from "../../../application/use-cases/category/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "../../../application/use-cases/category/DeleteCategoryUseCase";
import { GetCategoryUseCase } from "../../../application/use-cases/category/GetCategoryUseCase";
import { ListCategoriesUseCase } from "../../../application/use-cases/category/ListCategoriesUseCase";
import { UpdateCategoryUseCase } from "../../../application/use-cases/category/UpdateCategoryUseCase";
import { ValidationError } from "../../../domain/errors/AppError";
import { http } from "../../../shared/http";
import {
  categoryIdParamSchema,
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../validators/categoryValidators";

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listCategoriesSchema.safeParse(req.query);
    if (!query.success) {
      throw new ValidationError(
        query.error.issues[0]?.message ?? "Invalid query parameters"
      );
    }

    const result = await this.listCategoriesUseCase.execute(query.data);
    res.status(http.OK).json(result);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const params = categoryIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid category id"
      );
    }

    const category = await this.getCategoryUseCase.execute(params.data.id);
    res.status(http.OK).json({ success: true, data: category });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createCategorySchema.safeParse(req.body);
    if (!body.success) {
      throw new ValidationError(
        body.error.issues[0]?.message ?? "Invalid request body"
      );
    }

    const category = await this.createCategoryUseCase.execute(body.data);
    res
      .status(http.CREATED)
      .location(`/api/categories/${category.id}`)
      .json({ success: true, data: category });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const params = categoryIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid category id"
      );
    }

    const body = updateCategorySchema.safeParse(req.body);
    if (!body.success) {
      throw new ValidationError(
        body.error.issues[0]?.message ?? "Invalid request body"
      );
    }

    const category = await this.updateCategoryUseCase.execute(
      params.data.id,
      body.data
    );
    res.status(http.OK).json({ success: true, data: category });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const params = categoryIdParamSchema.safeParse(req.params);
    if (!params.success) {
      throw new ValidationError(
        params.error.issues[0]?.message ?? "Invalid category id"
      );
    }

    await this.deleteCategoryUseCase.execute(params.data.id);
    res.status(http.NO_CONTENT).send();
  };
}
