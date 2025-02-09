import { Injectable } from '@angular/core';
import { OrderModel } from '../models/order.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orders: OrderModel[] = [];

  constructor(
    private http: HttpClient
  ) { 
    this.getAll();
  }

  getAll(){
    this.http.get<OrderModel[]>("http://localhost:5000/orders").subscribe({
      next: (res) => {
        this.orders = res;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    })
  }
}
