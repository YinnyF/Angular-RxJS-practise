import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, map, merge, Observable, Subject, tap, throwError, scan, shareReplay, filter } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Action } from '../shared/edit-action';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  // *** DATA STREAMS FOR PRODUCTS AND PRODUCTS WITH CAT ***
  // map each product to a new product object
  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price ? product.price * 1.5 : 0,
        category: categories.find(c => product.categoryId == c.id)?.name,
        searchKey: [product.productName]
      } as Product))
    ),
    shareReplay(1),
  )

  // *** ACTION STREAMS ***
  // action stream for selected product (by id)
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selectedProduct', product)),
    shareReplay(1)
  )

  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ]).pipe(
    map(([selectedProduct, suppliers]) =>
      suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id))
    )
  )

  // // action stream for new product created
  // private productInsertedSubject = new Subject<Product>();
  // productInsertedAction$ = this.productInsertedSubject.asObservable();

  // // combine action stream with data stream
  // productsWithAdd$ = merge(
  //   this.productsWithCategory$,
  //   this.productInsertedAction$
  // ).pipe(
  //   scan((acc, value) =>
  //     (value instanceof Array) ? [...value] : [...acc, value], [] as Product[]
  //   )
  // );

  // action stream for add/update/delete products
  // FYI: Action here is a custom interface from '../../shared/edit-action'
  private productModifiedSubject = new Subject<Action<Product>>();
  productModifiedAction$ = this.productModifiedSubject.asObservable();

  productsWithCRUD$ = merge(
    this.productsWithCategory$,
    this.productModifiedAction$
  ).pipe(
    scan((acc, value) =>
      (value instanceof Array) ? [...value] : this.modifyProducts(acc, value), [] as Product[]
    )
  );

  private modifyProducts(products: Product[], operation: Action<Product>): Product[] {
    switch (operation.action) {
      case 'add':
        // return a new array with the added product pushed to it
        return [...products, operation.item]
        break;
      case 'update':
        // return a new array with the updated product replaced
        return products.map(product =>
          product.id === operation.item.id ? operation.item : product
        )
        break;
      case 'delete':
        // Filter out the deleted product
        return products.filter(product => product.id !== operation.item.id);
        break;
      default:
        return [...products];
    }
  }

  constructor(
    private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) { }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();

    this.productModifiedSubject.next({
      item: newProduct,
      action: 'add'
    });
  }

  updateProduct(selectedProduct: Product): void {
    // update a copy of the selected product

    // for now 'updating' a product is just increasing the quantity.
    const updatedProduct = {
      ...selectedProduct,
      quantityInStock: selectedProduct.quantityInStock ? selectedProduct.quantityInStock + 1 : 1
    } as Product;

    this.productModifiedSubject.next({
      item: updatedProduct,
      action: 'update'
    });
  }

  deleteProduct(selectedProduct: Product): void {
    this.productModifiedSubject.next({
      item: selectedProduct,
      action: 'delete'
    });
  }

  // *** PRIVATE METHODS **
  private fakeProduct(): Product {
    // TODO: Bug - ids are not unique
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
