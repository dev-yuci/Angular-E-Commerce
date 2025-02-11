import { Component, OnInit } from '@angular/core';
import { SearchComponent } from '../../common/components/search/search.component';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { TrCurrencyPipe } from 'tr-currency';
import { ProductService } from '../../services/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ShoppingCartModel } from '../../models/shopping-cart.model';
import { OrderModel } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-shopping-carts',
  standalone: true,
  imports: [SearchComponent, TrCurrencyPipe, FormsModule],
  templateUrl: './shopping-carts.component.html',
  styleUrl: './shopping-carts.component.css'
})
export class ShoppingCartsComponent implements OnInit{

  constructor(
    public _cart: ShoppingCartService,
    private _product: ProductService,
    public _order: OrderService,
    private _http: HttpClient
  ) {}

  ngOnInit(): void {}

  removeByIndex(index: number) {
    const cart = this._cart.shoppingCarts[index];
    const product = this._product.products.find(p => p.id == cart.productId);

    if(product !== undefined) {
      product.stock += cart.quantity;

      this._http.put("http://localhost:5000/products/" + product.id, product).subscribe({
        next: () => {
          this._product.getAll();
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      })
    }
    this._http.delete("http://localhost:5000/shoppingCarts/" + cart.id).subscribe({
      next: () => {
        this._cart.getAll();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  increment(cart: ShoppingCartModel) {
    const product = this._product.products.find(p => p.id == cart.productId);
    if(product !== undefined) {
      if(product.stock > 0) {
        cart.quantity++;
        this._http.put("http://localhost:5000/shoppingCarts/" + cart.id, cart).subscribe(() => this._cart.getAll());

        product.stock--;
        this._http.put("http://localhost:5000/products/" + product.id, product).subscribe(() => this._product.getAll());
      }
    }
  }

  decrement(cart: ShoppingCartModel, index:number) {
    if(cart.quantity === 1) {
      this.removeByIndex(index);
    } else {
      const product = this._product.products.find(p => p.id == cart.productId);
      if(product !== undefined) {
        cart.quantity--;
        this._http.put("http://localhost:5000/shoppingCarts/" + cart.id, cart).subscribe(() => this._cart.getAll());

        product.stock++;
        this._http.put("http://localhost:5000/products/" + product.id, product).subscribe(() => this._product.getAll());
      }
    }
  }

  async pay(form:NgForm) {
    if(form.valid) {
      for(const data of this._cart.shoppingCarts) {
        
        const amount = data.quantity * data.price;
        const kdv = amount - (amount / ((data.kdvRate / 100) + 1))

        let lastOrderSuffix = 0;

        const orders = await fetch("http://localhost:5000/orders").then(res => res.json())
        
        if(this._order.orders.length > 0) {
        lastOrderSuffix = this._order.orders[this._order.orders.length - 1].orderNumberSuffix;
        }

        const order: OrderModel = {
          id: "4568",
          date: new Date().toString(),
          productKDVRate: data.kdvRate,
          productPrice: data.price,
          productName: data.name,
          productQuantity: data.quantity,
          productImageURL: data.imageUrl,
          total: amount,
          totalAmount: amount - kdv,
          totalKDV: kdv,
          orderNumberPrefix: "TS" + new Date().getFullYear(),
          orderNumberSuffix: lastOrderSuffix + 1,
          orderNumber: ""
        };

        order.orderNumber = order.orderNumberPrefix + order.orderNumberSuffix.toString().padStart(10, "0");

        await fetch("http://localhost:5000/orders", {
          method: "POST",
          body: JSON.stringify(order)
        });
        await fetch("http://localhost:5000/shoppingCarts/" + data.id, {
          method: "DELETE",
        });
      }
      setTimeout(() => {
        this._cart.getAll();
      }, 300);
    }
  }
}
