import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : Storage.ExternalBlob;
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    productName : Text;
    price : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    contactNumber : Text;
    city : ?Text;
    items : [OrderItem];
    totalAmount : Nat;
    timestamp : Time.Time;
  };

  type CreateProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : Storage.ExternalBlob;
  };

  type UpdateProductInput = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : Storage.ExternalBlob;
  };

  type CreateCategoryInput = {
    name : Text;
  };

  type OrderItemInput = {
    productId : Nat;
    quantity : Nat;
    productName : Text;
    price : Nat;
  };

  type CreateOrderInput = {
    customerName : Text;
    contactNumber : Text;
    city : ?Text;
    items : [OrderItemInput];
    totalAmount : Nat;
  };

  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let orders = Map.empty<Nat, Order>();

  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextOrderId = 1;

  public shared ({ caller }) func addProduct(input : CreateProductInput) : async Nat {
    let product : Product = {
      id = nextProductId;
      name = input.name;
      description = input.description;
      price = input.price;
      category = input.category;
      image = input.image;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func updateProduct(input : UpdateProductInput) : async () {
    switch (products.get(input.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id = input.id;
          name = input.name;
          description = input.description;
          price = input.price;
          category = input.category;
          image = input.image;
        };
        products.add(input.id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(productId);
      };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductById(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public shared ({ caller }) func addCategory(input : CreateCategoryInput) : async Nat {
    let category : Category = {
      id = nextCategoryId;
      name = input.name;
    };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category.id;
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.remove(categoryId);
      };
    };
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared ({ caller }) func placeOrder(input : CreateOrderInput) : async Nat {
    let order : Order = {
      id = nextOrderId;
      customerName = input.customerName;
      contactNumber = input.contactNumber;
      city = input.city;
      items = input.items;
      totalAmount = input.totalAmount;
      timestamp = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared ({ caller }) func deleteOrder(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?_) {
        orders.remove(orderId);
      };
    };
  };
};
