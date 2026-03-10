import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Loader2,
  Minus,
  Plus,
  Settings,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useGetCategories,
  useGetProducts,
  usePlaceOrder,
} from "../hooks/useQueries";

interface CartItem {
  product: Product;
  quantity: number;
}

interface Props {
  onAdminClick: () => void;
}

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export default function PublicStorePage({ onAdminClick }: Props) {
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategories();
  const placeOrderMutation = usePlaceOrder();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("");
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: bigint, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: bigint) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!contactNumber.trim()) {
      toast.error("Please enter your contact number");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      await placeOrderMutation.mutateAsync({
        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        city: city.trim() || undefined,
        totalAmount: BigInt(cartTotal),
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: BigInt(item.quantity),
          price: item.product.price,
        })),
      });
      toast.success("Order placed successfully! 🎉");
      setCart([]);
      setCartOpen(false);
      setCheckoutOpen(false);
      setCustomerName("");
      setContactNumber("");
      setCity("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order. Please try again.");
    }
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    } else {
      toast.info(
        'Open this site in Chrome on Android, tap the menu (⋮) and select "Add to Home Screen"',
      );
    }
  };

  const allCategories = ["All", ...categories.map((c) => c.name)];
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            🏠 Tasty Home
          </h1>
          <div className="flex items-center gap-2">
            {!pwaInstalled && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/20 text-xs gap-1"
                onClick={handlePwaInstall}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add to Home</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/20"
              onClick={onAdminClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-primary-foreground hover:bg-white/20"
              onClick={() => setCartOpen(true)}
              data-ocid="cart.open_modal_button"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-warm-brown text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-tastyhome.dim_1200x500.jpg"
          alt="Tasty Home - Fresh & Homemade"
          className="w-full h-40 sm:h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex items-center px-6">
          <div>
            <p className="font-heading text-primary-foreground text-xl sm:text-3xl font-bold">
              Good Food Products
            </p>
            <p className="text-primary-foreground/90 text-sm mt-1">
              Homemade with love ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-4xl mx-auto w-full px-4 py-4">
        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {["a", "b", "c"].map((k) => (
              <Skeleton key={k} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {allCategories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`w-full text-sm font-medium ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/30 text-primary hover:bg-primary/10"
                }`}
                onClick={() => setSelectedCategory(cat)}
                data-ocid="store.category_filter.tab"
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-8">
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="store.products.empty_state"
          >
            <p className="font-heading text-2xl text-muted-foreground">
              No products found
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try selecting a different category
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-96 p-0 flex flex-col"
          data-ocid="cart.sheet"
        >
          <SheetHeader className="px-4 py-4 border-b border-border bg-primary text-primary-foreground">
            <SheetTitle className="font-heading text-primary-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({cartCount} items)
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center flex-col gap-3"
              data-ocid="cart.empty_state"
            >
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <p className="font-heading text-lg text-muted-foreground">
                Your cart is empty
              </p>
              <Button
                variant="outline"
                onClick={() => setCartOpen(false)}
                className="border-primary text-primary"
              >
                Continue Shopping
              </Button>
            </div>
          ) : !checkoutOpen ? (
            <>
              <ScrollArea className="flex-1">
                <div className="px-4 py-3 space-y-3">
                  {cart.map((item) => (
                    <CartItemRow
                      key={String(item.product.id)}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-border px-4 py-4 bg-muted/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-heading text-lg font-semibold">
                    Total
                  </span>
                  <span className="font-heading text-xl font-bold text-primary">
                    ₹{cartTotal}
                  </span>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => setCheckoutOpen(true)}
                  data-ocid="cart.checkout.button"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCheckoutOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="font-heading font-semibold">
                  Enter Your Details
                </span>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-4 py-3 space-y-4">
                  <div>
                    <Label
                      htmlFor="customerName"
                      className="text-sm font-medium"
                    >
                      Your Name *
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1"
                      data-ocid="cart.name.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="contactNumber"
                      className="text-sm font-medium"
                    >
                      Contact Number *
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder="Enter your phone number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="mt-1"
                      data-ocid="cart.contact.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                      data-ocid="cart.city.input"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {cart.map((item) => (
                      <div
                        key={String(item.product.id)}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.product.name} ×{item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{Number(item.product.price) * item.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">₹{cartTotal}</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="border-t border-border px-4 py-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending}
                  data-ocid="cart.place_order.submit_button"
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing
                      Order...
                    </>
                  ) : (
                    "Place Order 🎉"
                  )}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <footer className="bg-warm-brown text-primary-foreground py-6 text-center text-sm">
        <p className="font-heading text-base mb-1">🏠 Tasty Home</p>
        <p className="text-primary-foreground/70">
          Homemade with love, delivered to your door
        </p>
        <p className="mt-3 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  const imageUrl = product.image.getDirectURL();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="bg-card rounded-xl overflow-hidden shadow-sm border border-border flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">
            🍱
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs">
          {product.category}
        </Badge>
      </div>
      <div className="flex flex-col flex-1 p-3">
        <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-base mb-3">
          ₹{Number(product.price)}
        </p>
        <Button
          size="sm"
          className="mt-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          onClick={() => onAddToCart(product)}
          data-ocid="store.add_to_cart.button"
        >
          <Plus className="h-3 w-3 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: bigint, delta: number) => void;
  onRemove: (id: bigint) => void;
}) {
  const imageUrl = item.product.image.getDirectURL();
  return (
    <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.product.name}
          className="h-14 w-14 rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center text-2xl flex-shrink-0">
          🍱
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight line-clamp-1">
          {item.product.name}
        </p>
        <p className="text-primary font-bold text-sm">
          ₹{Number(item.product.price) * item.quantity}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-primary/30"
            onClick={() => onUpdateQuantity(item.product.id, -1)}
            data-ocid="cart.quantity_decrease.button"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-semibold">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 border-primary/30"
            onClick={() => onUpdateQuantity(item.product.id, 1)}
            data-ocid="cart.quantity_increase.button"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
        onClick={() => onRemove(item.product.id)}
        data-ocid="cart.remove_item.button"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
