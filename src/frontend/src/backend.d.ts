import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Order {
    id: bigint;
    customerName: string;
    productId: bigint;
    productName: string;
    cityName: string;
    timestamp: Time;
    contactNumber: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
}
export interface backendInterface {
    addProduct(pin: string, name: string, description: string, price: number, imageUrl: string): Promise<void>;
    deleteProduct(pin: string, id: bigint): Promise<void>;
    editProduct(pin: string, id: bigint, name: string, description: string, price: number, imageUrl: string): Promise<void>;
    listOrders(pin: string): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    submitOrder(productId: bigint, productName: string, customerName: string, contactNumber: string, cityName: string): Promise<void>;
    verifyAdminPin(pin: string): Promise<boolean>;
}
