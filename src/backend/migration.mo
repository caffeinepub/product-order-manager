import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";

module {
  type OldProduct = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
    category : Text;
  };

  type OldOrder = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    contactNumber : Text;
    cityName : Text;
    timestamp : Time.Time;
  };

  type OldCategory = {
    id : Nat;
    name : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    orders : Map.Map<Nat, OldOrder>;
    categories : Map.Map<Nat, OldCategory>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextCategoryId : Nat;
    adminPin : Text;
  };

  type NewProduct = {
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

  type NewActor = {
    products : Map.Map<Nat, NewProduct>;
    categories : Map.Map<Nat, Category>;
    orders : Map.Map<Nat, Order>;
    nextProductId : Nat;
    nextCategoryId : Nat;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          price = 0;
          image = "no-image";
        };
      }
    );

    let newOrders = Map.empty<Nat, Order>();

    {
      products = newProducts;
      categories = old.categories;
      orders = newOrders;
      nextProductId = old.nextProductId;
      nextCategoryId = old.nextCategoryId;
      nextOrderId = old.nextOrderId;
    };
  };
};
