import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

module {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
  };

  type OldOrder = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    contactNumber : Text;
    timestamp : Int;
  };

  type NewOrder = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    contactNumber : Text;
    cityName : Text;
    timestamp : Int;
  };

  type OldActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, OldOrder>;
    adminPin : Text;
  };

  type NewActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, NewOrder>;
    adminPin : Text;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          cityName = ""
        };
      }
    );
    { old with orders = newOrders };
  };
};
