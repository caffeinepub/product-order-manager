import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import Time "mo:core/Time";



// Specify the data migration function in with-clause

actor {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
    category : Text;
  };

  type Order = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    contactNumber : Text;
    cityName : Text;
    timestamp : Time.Time;
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextCategoryId = 1;

  // Store products, orders, and categories in persistent maps
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let categories = Map.empty<Nat, Category>();

  var adminPin = "0852";

  func verifyAdmin(pin : Text) {
    if (pin != adminPin) { Runtime.trap("Invalid PIN!") };
  };

  public shared ({ caller }) func addProduct(pin : Text, name : Text, description : Text, price : Float, imageUrl : Text, category : Text) : async () {
    verifyAdmin(pin);
    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      imageUrl;
      category;
    };
    nextProductId += 1;
    products.add(product.id, product);
  };

  public shared ({ caller }) func editProduct(pin : Text, id : Nat, name : Text, description : Text, price : Float, imageUrl : Text, category : Text) : async () {
    verifyAdmin(pin);
    let product : Product = {
      id;
      name;
      description;
      price;
      imageUrl;
      category;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func deleteProduct(pin : Text, id : Nat) : async () {
    verifyAdmin(pin);
    if (products.isEmpty()) {
      Runtime.trap("No products available. ");
    };
    products.remove(id);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func submitOrder(
    productId : Nat,
    productName : Text,
    customerName : Text,
    contactNumber : Text,
    cityName : Text,
  ) : async () {
    if (products.isEmpty()) {
      Runtime.trap("No products available. ");
    };
    let order : Order = {
      id = nextOrderId;
      productId;
      productName;
      customerName;
      contactNumber;
      cityName;
      timestamp = Time.now();
    };
    nextOrderId += 1;
    orders.add(order.id, order);
  };

  public query ({ caller }) func listOrders(pin : Text) : async [Order] {
    verifyAdmin(pin);
    orders.values().toArray();
  };

  public shared ({ caller }) func verifyAdminPin(pin : Text) : async Bool {
    pin == adminPin;
  };

  public shared ({ caller }) func addCategory(pin : Text, name : Text) : async Nat {
    verifyAdmin(pin);
    let category : Category = {
      id = nextCategoryId;
      name;
    };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category.id;
  };

  public shared ({ caller }) func deleteCategory(pin : Text, id : Nat) : async () {
    verifyAdmin(pin);
    if (categories.isEmpty()) {
      Runtime.trap("No categories available. ");
    };
    categories.remove(id);
  };

  public query ({ caller }) func listCategories() : async [Category] {
    categories.values().toArray();
  };
};
