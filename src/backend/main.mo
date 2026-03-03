import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
  };

  type Order = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    contactNumber : Text;
    timestamp : Time.Time;
  };

  var nextProductId = 1;
  var nextOrderId = 1;
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();

  let adminPin = "0852";

  public shared ({ caller }) func addProduct(_pin : Text, name : Text, description : Text, price : Float, imageUrl : Text) : async () {
    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      imageUrl;
    };
    nextProductId += 1;
    products.add(product.id, product);
  };

  public shared ({ caller }) func editProduct(_pin : Text, id : Nat, name : Text, description : Text, price : Float, imageUrl : Text) : async () {
    let product : Product = {
      id;
      name;
      description;
      price;
      imageUrl;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func deleteProduct(_pin : Text, id : Nat) : async () {
    if (products.isEmpty()) { Runtime.trap("No products available. ") };
    products.remove(id);
  };

  public query ({ caller }) func listProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func submitOrder(productId : Nat, productName : Text, customerName : Text, contactNumber : Text) : async () {
    if (products.isEmpty()) { Runtime.trap("No products available. ") };
    let order : Order = {
      id = nextOrderId;
      productId;
      productName;
      customerName;
      contactNumber;
      timestamp = Time.now();
    };
    nextOrderId += 1;
    orders.add(order.id, order);
  };

  public query ({ caller }) func listOrders(_pin : Text) : async [Order] {
    orders.values().toArray();
  };

  public shared ({ caller }) func verifyAdminPin(pin : Text) : async Bool {
    pin == adminPin;
  };
};
