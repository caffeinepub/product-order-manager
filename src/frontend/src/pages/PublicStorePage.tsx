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
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Package,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useListProducts, useSubmitOrder } from "../hooks/useQueries";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Artisan Sourdough Loaf",
    description:
      "Slow-fermented 72-hour sourdough with a golden crackling crust and tender open crumb. Baked fresh daily using heritage wheat flour.",
    price: 12.5,
    imageUrl: "/assets/generated/food-sourdough.dim_600x400.jpg",
  },
  {
    id: BigInt(2),
    name: "Aged Cheese Selection",
    description:
      "A curated board of three hand-selected aged cheeses — nutty Comté, creamy Manchego, and tangy aged cheddar. Perfect for entertaining.",
    price: 34.0,
    imageUrl: "/assets/generated/food-cheese.dim_600x400.jpg",
  },
  {
    id: BigInt(3),
    name: "Cold-Press Olive Oil",
    description:
      "Single-origin extra virgin olive oil, cold-pressed from hand-harvested Arbequina olives. Fruity, peppery finish. 500ml dark glass bottle.",
    price: 24.95,
    imageUrl: "/assets/generated/food-olive-oil.dim_600x400.jpg",
  },
  {
    id: BigInt(4),
    name: "Signature Spice Blend",
    description:
      "Our house-blended aromatic mix of warming spices: smoked paprika, cumin, coriander, turmeric, and a hint of chili. 80g resealable pouch.",
    price: 9.99,
    imageUrl: "/assets/generated/food-spice-blend.dim_600x400.jpg",
  },
  {
    id: BigInt(5),
    name: "Raw Wildflower Honey",
    description:
      "Unfiltered, unpasteurized honey harvested from meadow wildflowers. Rich, complex floral notes. 350g glass jar with wooden dipper.",
    price: 18.0,
    imageUrl: "/assets/generated/food-honey.dim_600x400.jpg",
  },
  {
    id: BigInt(6),
    name: "Fresh Egg Pasta",
    description:
      "Handmade tagliatelle crafted with free-range eggs and semolina. Ready to cook in 2 minutes. Serves 2. Made to order, same-day delivery.",
    price: 8.5,
    imageUrl: "/assets/generated/food-fresh-pasta.dim_600x400.jpg",
  },
];

interface Props {
  onAdminClick: () => void;
}

interface OrderForm {
  customerName: string;
  contactNumber: string;
}

export default function PublicStorePage({ onAdminClick }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customerName: "",
    contactNumber: "",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});

  const { data: products, isLoading } = useListProducts();
  const submitOrder = useSubmitOrder();

  const displayProducts =
    products && products.length > 0 ? products : SAMPLE_PRODUCTS;

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

  const handleOrderSubmit = async () => {
    if (!selectedProduct || !validate()) return;
    try {
      await submitOrder.mutateAsync({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        customerName: orderForm.customerName.trim(),
        contactNumber: orderForm.contactNumber.trim(),
      });
      setOrderSuccess(true);
      toast.success("Order placed! We'll be in touch shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedProduct(null);
      setOrderForm({ customerName: "", contactNumber: "" });
      setFormErrors({});
      setOrderSuccess(false);
      submitOrder.reset();
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
      </header>

      {/* Hero */}
      <section className="relative pt-16 pb-12 overflow-hidden">
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
              No products yet
            </h2>
            <p className="text-muted-foreground">
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="products.list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayProducts.map((product, index) => (
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
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h2 className="font-display font-bold text-base text-foreground mb-2 leading-snug line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                    {product.description}
                  </p>

                  <Button
                    className="w-full gap-2 font-body font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 btn-glow transition-all rounded-xl h-10"
                    onClick={() => setSelectedProduct(product)}
                    data-ocid={`products.order_button.${index + 1}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Order Now
                  </Button>
                </div>
              </motion.article>
            ))}
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

      {/* Order Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={handleDialogClose}>
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
                  onClick={() => handleDialogClose(false)}
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
                    Order: {selectedProduct?.name}
                  </DialogTitle>
                  <p className="font-body text-sm text-muted-foreground">
                    Leave your details and we'll reach out to complete your
                    purchase.
                  </p>
                </DialogHeader>

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
                      <p className="text-destructive text-xs font-body">
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
                        placeholder="+1 (555) 000-0000"
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
                          if (e.key === "Enter") handleOrderSubmit();
                        }}
                        className="pl-9 font-body rounded-xl h-11"
                        data-ocid="order.contact_input"
                        autoComplete="tel"
                      />
                    </div>
                    {formErrors.contactNumber && (
                      <p className="text-destructive text-xs font-body">
                        {formErrors.contactNumber}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="pt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    className="font-body font-semibold rounded-xl flex-1 border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleOrderSubmit}
                    disabled={submitOrder.isPending}
                    data-ocid="order.submit_button"
                    className="bg-primary text-primary-foreground font-body font-semibold rounded-xl flex-1 btn-glow"
                  >
                    {submitOrder.isPending ? (
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
