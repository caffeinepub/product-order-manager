import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Category {
    id: bigint;
    name: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: bigint;
}
export type Time = bigint;
export interface OrderItem {
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface OrderItemInput {
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface CreateProductInput {
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    city?: string;
    totalAmount: bigint;
    timestamp: Time;
    contactNumber: string;
    items: Array<OrderItem>;
}
export interface UpdateProductInput {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image: ExternalBlob;
    price: bigint;
}
export interface CreateOrderInput {
    customerName: string;
    city?: string;
    totalAmount: bigint;
    contactNumber: string;
    items: Array<OrderItemInput>;
}
export interface CreateCategoryInput {
    name: string;
}
export interface backendInterface {
    addCategory(input: CreateCategoryInput): Promise<bigint>;
    addProduct(input: CreateProductInput): Promise<bigint>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteOrder(orderId: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getCategories(): Promise<Array<Category>>;
    getOrders(): Promise<Array<Order>>;
    getProductById(productId: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    placeOrder(input: CreateOrderInput): Promise<bigint>;
    updateProduct(input: UpdateProductInput): Promise<void>;
}
