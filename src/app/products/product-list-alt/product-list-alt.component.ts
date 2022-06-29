import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, EMPTY, Subscription } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';

  // stream of all products
  products$ = this.productService.productsWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      }));

  // a stream of emitted selected products, each time it changes. 
  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}