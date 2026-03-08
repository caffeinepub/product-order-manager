import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useListCategories, useListProducts } from "../hooks/useQueries";

type CategoryKey = string;

const CATEGORY_PALETTE = [
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
];

function getCategoryColor(index: number) {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Artisan Sourdough Loaf",
    description:
      "Slow-fermented 72-hour sourdough with a golden crackling crust and tender open crumb. Baked fresh daily using heritage wheat flour.",
    price: 12.5,
    imageUrl: "/assets/generated/food-sourdough.dim_600x400.jpg",
    category: "Groceries",
  },
  {
    id: BigInt(2),
    name: "Aged Cheese Selection",
    description:
      "A curated board of three hand-selected aged cheeses — nutty Comté, creamy Manchego, and tangy aged cheddar. Perfect for entertaining.",
    price: 34.0,
    imageUrl: "/assets/generated/food-cheese.dim_600x400.jpg",
    category: "Groceries",
  },
  {
    id: BigInt(3),
    name: "Cold-Press Olive Oil",
    description:
      "Single-origin extra virgin olive oil, cold-pressed from hand-harvested Arbequina olives. Fruity, peppery finish. 500ml dark glass bottle.",
    price: 24.95,
    imageUrl: "/assets/generated/food-olive-oil.dim_600x400.jpg",
    category: "Pickles",
  },
  {
    id: BigInt(4),
    name: "Signature Spice Blend",
    description:
      "Our house-blended aromatic mix of warming spices: smoked paprika, cumin, coriander, turmeric, and a hint of chili. 80g resealable pouch.",
    price: 9.99,
    imageUrl: "/assets/generated/food-spice-blend.dim_600x400.jpg",
    category: "Groceries",
  },
  {
    id: BigInt(5),
    name: "Raw Wildflower Honey",
    description:
      "Unfiltered, unpasteurized honey harvested from meadow wildflowers. Rich, complex floral notes. 350g glass jar with wooden dipper.",
    price: 18.0,
    imageUrl: "/assets/generated/food-honey.dim_600x400.jpg",
    category: "Dry Fruits",
  },
  {
    id: BigInt(6),
    name: "Fresh Egg Pasta",
    description:
      "Handmade tagliatelle crafted with free-range eggs and semolina. Ready to cook in 2 minutes. Serves 2. Made to order, same-day delivery.",
    price: 8.5,
    imageUrl: "/assets/generated/food-fresh-pasta.dim_600x400.jpg",
    category: "Groceries",
  },
];

interface Props {
  onAdminClick: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderForm {
  customerName: string;
  contactNumber: string;
  cityName: string;
}

export default function PublicStorePage({ onAdminClick }: Props) {
  const [activeTab, setActiveTab] = useState<CategoryKey>("all");
  const [isInstalled, setIsInstalled] = useState(false);
  const [_hasPrompt, setHasPrompt] = useState(false);
  const promptRef = useRef<Event | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: "",
    contactNumber: "",
    cityName: "",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { actor } = useActor();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e;
      setHasPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const mq = window.matchMedia("(display-mode: standalone)");
    if (mq.matches) setIsInstalled(true);
    const mqHandler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mq.addEventListener("change", mqHandler);

    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = promptRef.current as
      | (Event & {
          prompt: () => void;
          userChoice: Promise<{ outcome: string }>;
        })
      | null;
    if (!prompt) {
      toast.info(
        "To install: tap the browser menu and select 'Add to Home Screen'.",
      );
      return;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setHasPrompt(false);
      promptRef.current = null;
    }
  };

  // Cart functions
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`, { duration: 2000 });
  };

  const removeFromCart = (productId: bigint) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const updateQuantity = (productId: bigint, qty: number) => {
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const { data: products, isLoading } = useListProducts();
  const categoriesQuery = useListCategories();

  const allProducts =
    products && products.length > 0 ? products : SAMPLE_PRODUCTS;

  const categories = categoriesQuery.data ?? [];

  const categoryColorMap: Record<string, string> = {};
  categories.forEach((cat, index) => {
    categoryColorMap[cat.name] = getCategoryColor(index);
  });

  const activeTabLabel =
    activeTab === "all"
      ? "All"
      : (categories.find((c) => c.name === activeTab)?.name ?? activeTab);

  const displayProducts =
    activeTab === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === activeTab);

  const validate = () => {
    const errors: Partial<OrderForm> = {};
    if (!orderForm.customerName.trim())
      errors.customerName = "Name is required";
    if (!orderForm.contactNumber.trim())
      errors.contactNumber = "Contact number is required";
    else if (!/^[\d\s+\-().]{7,}$/.test(orderForm.contactNumber)) {
      errors.contactNumber = "Enter a valid contact number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = async () => {
    if (!validate() || cartItems.length === 0 || !actor) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        cartItems.map((item) => {
          const productName =
            item.quantity > 1
              ? `${item.product.name} (x${item.quantity})`
              : item.product.name;
          return actor.submitOrder(
            item.product.id,
            productName,
            orderForm.customerName.trim(),
            orderForm.contactNumber.trim(),
            orderForm.cityName.trim(),
          );
        }),
      );
      setOrderSuccess(true);
      toast.success("Order placed! We'll be in touch shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutClose = (open: boolean) => {
    if (!open) {
      setOrderForm({ customerName: "", contactNumber: "", cityName: "" });
      setFormErrors({});
      if (orderSuccess) {
        clearCart();
        setIsCartOpen(false);
      }
      setOrderSuccess(false);
      setIsCheckoutOpen(false);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                Harvest<span className="text-primary"> Table</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isInstalled && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInstall}
                  data-ocid="nav.install_button"
                  className="gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add to Home Screen</span>
                  <span className="sm:hidden">Install</span>
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                data-ocid="store.cart_button"
                className="relative gap-2 font-body text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                    {totalItemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onAdminClick}
                data-ocid="nav.admin_link"
                className="gap-2 font-body text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-transparent to-transparent pointer-events-none" />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight mb-4">
              Good Food Products,
              <br />
              <span className="text-primary">Straight to Your Door</span>
            </h1>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Order anything you love and we'll reach out personally to arrange
              delivery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Buttons */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="grid grid-cols-3 gap-2 w-full sm:max-w-sm">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
            data-ocid="store.all_tab"
            className="font-display font-semibold text-sm rounded-xl h-10 transition-all"
          >
            All
          </Button>

          {categoriesQuery.isLoading
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))
            : categories.map((cat, index) => (
                <Button
                  key={cat.id.toString()}
                  variant={activeTab === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(cat.name)}
                  data-ocid={`store.category_tab.${index + 1}`}
                  className="font-display font-semibold text-sm rounded-xl h-10 transition-all"
                >
                  {cat.name}
                </Button>
              ))}
        </div>
      </div>

      {/* Products Grid */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(["c1", "c2", "c3", "c4", "c5", "c6"] as const).map((k) => (
              <div
                key={k}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-card"
              >
                <Skeleton className="h-52 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              {activeTab === "all"
                ? "No products yet"
                : `No ${activeTabLabel} available`}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "all"
                ? "Check back soon for new arrivals."
                : "Check back soon or browse another category."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="products.list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={activeTab}
          >
            {displayProducts.map((product, index) => {
              const catIndex = categories.findIndex(
                (c) => c.name === product.category,
              );
              const badgeColor =
                catIndex >= 0
                  ? getCategoryColor(catIndex)
                  : "bg-muted text-muted-foreground border-border";

              const cartItem = cartItems.find(
                (item) => item.product.id === product.id,
              );
              const inCart = !!cartItem;

              return (
                <motion.article
                  key={product.id.toString()}
                  data-ocid={`products.item.${index + 1}`}
                  variants={cardVariants}
                  className="bg-card rounded-2xl overflow-hidden border border-border shadow-card card-lift group cursor-default"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-muted h-52">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="price-pill font-body font-semibold text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    {inCart && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground font-body text-xs font-semibold">
                          In Cart ({cartItem.quantity})
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h2 className="font-display font-bold text-base text-foreground mb-1.5 leading-snug line-clamp-1">
                      {product.name}
                    </h2>

                    {product.category && (
                      <span
                        className={`inline-block text-xs font-display font-semibold px-2 py-0.5 rounded-full border mb-2.5 ${badgeColor}`}
                      >
                        {product.category}
                      </span>
                    )}

                    <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                      {product.description}
                    </p>

                    {inCart ? (
                      <div className="flex items-center gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 border border-border rounded-xl h-10 px-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                            onClick={() =>
                              updateQuantity(product.id, cartItem.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="font-body font-semibold text-sm text-foreground w-6 text-center">
                            {cartItem.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                            onClick={() =>
                              updateQuantity(product.id, cartItem.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 font-body font-semibold text-sm border-primary/40 text-primary hover:bg-primary/5 transition-all rounded-xl h-10"
                          onClick={() => setIsCartOpen(true)}
                          data-ocid={`products.add_to_cart_button.${index + 1}`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          View Cart
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-2 font-body font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 btn-glow transition-all rounded-xl h-10"
                        onClick={() => addToCart(product)}
                        data-ocid={`products.add_to_cart_button.${index + 1}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="right"
          data-ocid="store.cart_sheet"
          className="w-full sm:max-w-md flex flex-col p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
            <SheetTitle className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Your Cart
              {totalItemCount > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground font-body text-xs">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Your cart is empty
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  Add products to get started.
                </p>
              </div>
              <Button
                variant="outline"
                className="font-body font-semibold rounded-xl border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => setIsCartOpen(false)}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-5 py-4">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.product.id.toString()}
                      data-ocid={`cart.item.${index + 1}`}
                      className="flex gap-3 items-start"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-foreground line-clamp-1 mb-1">
                          {item.product.name}
                        </h4>
                        <p className="font-body font-semibold text-sm text-primary mb-2">
                          ₹
                          {(Number(item.product.price) * item.quantity).toFixed(
                            2,
                          )}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 border border-border rounded-lg h-8 px-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-body font-semibold text-xs text-foreground w-5 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.product.id)}
                            data-ocid={`cart.item.remove_button.${index + 1}`}
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <SheetFooter className="px-5 pt-4 pb-5 border-t border-border gap-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-body text-sm text-muted-foreground">
                    Subtotal ({totalItemCount}{" "}
                    {totalItemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-display font-bold text-lg text-foreground">
                    ₹{cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <Separator className="w-full" />
                <Button
                  className="w-full gap-2 font-body font-semibold bg-primary text-primary-foreground hover:bg-primary/90 btn-glow rounded-xl h-11 mt-1"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  data-ocid="cart.checkout_button"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Checkout ({totalItemCount}{" "}
                  {totalItemCount === 1 ? "item" : "items"})
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={handleCheckoutClose}>
        <DialogContent
          className="sm:max-w-md rounded-2xl bg-card"
          data-ocid="order.dialog"
        >
          <AnimatePresence mode="wait">
            {orderSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="py-8 flex flex-col items-center text-center gap-4"
                data-ocid="order.success_state"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">
                    Order Placed!
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Thank you, <strong>{orderForm.customerName}</strong>! We'll
                    contact you at <strong>{orderForm.contactNumber}</strong>{" "}
                    shortly.
                  </p>
                </div>
                <Button
                  className="bg-primary text-primary-foreground font-body font-semibold rounded-xl w-full"
                  onClick={() => handleCheckoutClose(false)}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <DialogHeader className="pb-4">
                  <DialogTitle className="font-display font-bold text-xl text-foreground">
                    Checkout
                  </DialogTitle>
                  <p className="font-body text-sm text-muted-foreground">
                    {cartItems.length === 1
                      ? `Ordering: ${cartItems[0].product.name}${cartItems[0].quantity > 1 ? ` (x${cartItems[0].quantity})` : ""}`
                      : `Ordering ${cartItems.length} products — ₹${cartSubtotal.toFixed(2)} total`}
                  </p>
                </DialogHeader>

                {/* Order Summary */}
                {cartItems.length > 1 && (
                  <div className="bg-muted/40 rounded-xl p-3 mb-4 space-y-1.5">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id.toString()}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="font-body text-sm text-foreground truncate">
                          {item.product.name}
                          {item.quantity > 1 && (
                            <span className="text-muted-foreground ml-1">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                        <span className="font-body text-sm font-semibold text-primary whitespace-nowrap">
                          ₹
                          {(Number(item.product.price) * item.quantity).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-1" />
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-display font-bold text-sm text-primary">
                        ₹{cartSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="customerName"
                      className="font-body font-semibold text-sm text-foreground"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customerName"
                        placeholder="Your full name"
                        value={orderForm.customerName}
                        onChange={(e) => {
                          setOrderForm((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }));
                          if (formErrors.customerName)
                            setFormErrors((prev) => ({
                              ...prev,
                              customerName: undefined,
                            }));
                        }}
                        className="pl-9 font-body rounded-xl h-11"
                        data-ocid="order.name_input"
                        autoComplete="name"
                      />
                    </div>
                    {formErrors.customerName && (
                      <p
                        className="text-destructive text-xs font-body"
                        data-ocid="order.name_error"
                      >
                        {formErrors.customerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contactNumber"
                      className="font-body font-semibold text-sm text-foreground"
                    >
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={orderForm.contactNumber}
                        onChange={(e) => {
                          setOrderForm((prev) => ({
                            ...prev,
                            contactNumber: e.target.value,
                          }));
                          if (formErrors.contactNumber)
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: undefined,
                            }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCheckoutSubmit();
                        }}
                        className="pl-9 font-body rounded-xl h-11"
                        data-ocid="order.contact_input"
                        autoComplete="tel"
                      />
                    </div>
                    {formErrors.contactNumber && (
                      <p
                        className="text-destructive text-xs font-body"
                        data-ocid="order.contact_error"
                      >
                        {formErrors.contactNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cityName"
                      className="font-body font-semibold text-sm text-foreground"
                    >
                      City{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="cityName"
                        placeholder="Your city"
                        value={orderForm.cityName}
                        onChange={(e) => {
                          setOrderForm((prev) => ({
                            ...prev,
                            cityName: e.target.value,
                          }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCheckoutSubmit();
                        }}
                        className="pl-9 font-body rounded-xl h-11"
                        data-ocid="order.city_input"
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCheckoutClose(false)}
                    className="font-body font-semibold rounded-xl flex-1 border-border"
                    data-ocid="order.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckoutSubmit}
                    disabled={isSubmitting || cartItems.length === 0}
                    data-ocid="cart.order_submit_button"
                    className="bg-primary text-primary-foreground font-body font-semibold rounded-xl flex-1 btn-glow"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
