import { CreateCategoryUseCase } from "../../application/use-cases/category/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "../../application/use-cases/category/DeleteCategoryUseCase";
import { GetCategoryUseCase } from "../../application/use-cases/category/GetCategoryUseCase";
import { ListCategoriesUseCase } from "../../application/use-cases/category/ListCategoriesUseCase";
import { UpdateCategoryUseCase } from "../../application/use-cases/category/UpdateCategoryUseCase";
import { CreateProductUseCase } from "../../application/use-cases/product/CreateProductUseCase";
import { DeleteProductUseCase } from "../../application/use-cases/product/DeleteProductUseCase";
import { GetProductUseCase } from "../../application/use-cases/product/GetProductUseCase";
import { ListProductsUseCase } from "../../application/use-cases/product/ListProductsUseCase";
import { UpdateProductUseCase } from "../../application/use-cases/product/UpdateProductUseCase";
import { CategoryController } from "../../presentation/http/controllers/CategoryController";
import { ProductController } from "../../presentation/http/controllers/ProductController";
import { db } from "../database/db";
import { PostgresCategoryRepository } from "../repositories/category/PostgresCategoryRepository";
import { PostgresProductRepository } from "../repositories/product/PostgresProductRepository";

export function createContainer() {
  const categoryRepository = new PostgresCategoryRepository(db);
  const productRepository = new PostgresProductRepository(db);

  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  const getCategoryUseCase = new GetCategoryUseCase(categoryRepository);
  const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
  const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
  const deleteCategoryUseCase = new DeleteCategoryUseCase(
    categoryRepository,
    productRepository
  );

  const createProductUseCase = new CreateProductUseCase(
    productRepository,
    categoryRepository
  );
  const getProductUseCase = new GetProductUseCase(productRepository);
  const listProductsUseCase = new ListProductsUseCase(productRepository);
  const updateProductUseCase = new UpdateProductUseCase(
    productRepository,
    categoryRepository
  );
  const deleteProductUseCase = new DeleteProductUseCase(productRepository);

  const categoryController = new CategoryController(
    createCategoryUseCase,
    getCategoryUseCase,
    listCategoriesUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase
  );

  const productController = new ProductController(
    createProductUseCase,
    getProductUseCase,
    listProductsUseCase,
    updateProductUseCase,
    deleteProductUseCase
  );

  return {
    categoryController,
    productController,
  };
}

export type AppContainer = ReturnType<typeof createContainer>;
