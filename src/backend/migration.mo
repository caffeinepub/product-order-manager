import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
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
    timestamp : Int;
  };

  type Category = {
    id : Nat;
    name : Text;
  };

  type OldActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    adminPin : Text;
  };

  type NewActor = {
    nextProductId : Nat;
    nextOrderId : Nat;
    nextCategoryId : Nat;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    categories : Map.Map<Nat, Category>;
    adminPin : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextCategoryId = 1;
      categories = Map.empty<Nat, Category>();
    };
  };
};
