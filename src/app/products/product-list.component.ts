import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, combineLatest, EMPTY, filter, map, Subject, startWith, BehaviorSubject } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  // selectedCategoryId?: number;

  // create action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  // product stream uses new productsWithCRUD$ stream
  products$ = combineLatest([
    this.productService.productsWithCRUD$,
    this.categorySelectedAction$
      .pipe(
        // set initial value
        startWith(0)
      ),
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );
  // products$ = this.productService.productsWithCategory$
  //   .pipe(
  //     catchError(err => {
  //       this.errorMessage = err;
  //       return EMPTY;
  //     })
  //   );

  // productsSimpleFilter$ = this.productService.productsWithCategory$
  //   .pipe(
  //     map(products =>
  //       products.filter(product =>
  //         this.selectedCategoryId ? this.selectedCategoryId === product.categoryId : true
  //       )
  //     )
  //   )

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    // this.selectedCategoryId = +categoryId;
    this.categorySelectedSubject.next(+categoryId);
  }

  onUpdate(product: Product): void {
    this.productService.updateProduct(product);
  }
  
  onDelete(product: Product): void {
    this.productService.deleteProduct(product);
  }
}