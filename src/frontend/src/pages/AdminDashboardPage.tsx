import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Edit2,
  FileText,
  Image as ImageIcon,
  IndianRupee,
  Link,
  Loader2,
  LogOut,
  Package,
  Phone,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useAddProduct,
  useDeleteProduct,
  useEditProduct,
  useListOrders,
  useListProducts,
} from "../hooks/useQueries";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
};

interface Props {
  onLogout: () => void;
}

export default function AdminDashboardPage({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState("orders");

  // Product modal state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductForm>>({});
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // ---- Queries ----
  const ordersQuery = useListOrders();
  const productsQuery = useListProducts();

  // ---- Mutations ----
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();

  // ---- Validation ----
  const validateForm = () => {
    const errors: Partial<ProductForm> = {};
    if (!productForm.name.trim()) errors.name = "Product name is required";
    if (!productForm.description.trim())
      errors.description = "Description is required";
    if (!productForm.price) {
      errors.price = "Price is required";
    } else if (
      Number.isNaN(Number.parseFloat(productForm.price)) ||
      Number.parseFloat(productForm.price) < 0
    ) {
      errors.price = "Enter a valid price";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Handlers ----
  const openAddDialog = () => {
    setEditingProduct(null);
    setProductForm(emptyForm);
    setFormErrors({});
    setImageMode("url");
    setUploadedFileName("");
    setProductDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
    });
    setFormErrors({});
    // If existing image looks like a data URL, default to upload mode; otherwise URL mode
    setImageMode(product.imageUrl.startsWith("data:") ? "upload" : "url");
    setUploadedFileName(
      product.imageUrl.startsWith("data:") ? "Existing image" : "",
    );
    setProductDialogOpen(true);
  };

  const closeProductDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
    setProductForm(emptyForm);
    setFormErrors({});
    setImageMode("url");
    setUploadedFileName("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateField("imageUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleProductSave = async () => {
    if (!validateForm()) return;
    try {
      if (editingProduct) {
        await editProduct.mutateAsync({
          id: editingProduct.id,
          name: productForm.name,
          description: productForm.description,
          price: Number.parseFloat(productForm.price),
          imageUrl: productForm.imageUrl,
        });
        toast.success("Product updated successfully");
      } else {
        await addProduct.mutateAsync({
          name: productForm.name,
          description: productForm.description,
          price: Number.parseFloat(productForm.price),
          imageUrl: productForm.imageUrl,
        });
        toast.success("Product added successfully");
      }
      closeProductDialog();
    } catch (err) {
      console.error(err);
      toast.error(
        editingProduct ? "Failed to update product" : "Failed to add product",
      );
    }
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      toast.success("Product deleted");
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const isSaving = addProduct.isPending || editProduct.isPending;

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateField = (field: keyof ProductForm, value: string) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field])
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-foreground tracking-tight">
                Harvest<span className="text-primary"> Table</span>
              </span>
              <span className="text-xs font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            data-ocid="admin.logout_button"
            className="gap-2 font-body text-sm border-border hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Products
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                {productsQuery.isLoading ? "—" : products.length}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Orders
                </span>
              </div>
              <p className="font-display font-bold text-3xl text-foreground">
                {ordersQuery.isLoading ? "—" : orders.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted rounded-xl p-1 mb-6 h-auto">
              <TabsTrigger
                value="orders"
                data-ocid="admin.orders_tab"
                className="font-display font-semibold text-sm rounded-lg px-5 py-2.5 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <ClipboardList className="w-4 h-4" />
                Orders
                {orders.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 h-5 min-w-5 rounded-full font-display font-bold">
                    {orders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="products"
                data-ocid="admin.products_tab"
                className="font-display font-semibold text-sm rounded-lg px-5 py-2.5 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                data-ocid="admin.orders_table"
              >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-bold text-base text-foreground">
                    Customer Orders
                  </h2>
                  {ordersQuery.isLoading && (
                    <Loader2
                      className="w-4 h-4 text-muted-foreground animate-spin"
                      data-ocid="admin.loading_state"
                    />
                  )}
                </div>

                {ordersQuery.isLoading ? (
                  <div className="p-6 space-y-3">
                    {(["s1", "s2", "s3", "s4"] as const).map((k) => (
                      <Skeleton key={k} className="h-16 rounded-xl" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    className="py-16 text-center"
                    data-ocid="admin.orders_table.empty_state"
                  >
                    <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground mb-1">
                      No orders yet
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      Customer orders will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          {["#", "Customer", "Contact", "Product", "Date"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-5 py-3 text-left font-display font-semibold text-xs text-muted-foreground uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr
                            key={order.id.toString()}
                            data-ocid={`admin.orders_table.row.${index + 1}`}
                            className="border-t border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <span className="font-body text-sm text-muted-foreground">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="font-body text-sm font-medium text-foreground">
                                  {order.customerName}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 font-body text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <a
                                  href={`tel:${order.contactNumber}`}
                                  className="text-primary hover:underline"
                                >
                                  {order.contactNumber}
                                </a>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-body text-sm text-foreground">
                                {order.productName}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {formatDate(order.timestamp)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-base text-foreground">
                    Manage Products
                  </h2>
                  <Button
                    onClick={openAddDialog}
                    data-ocid="admin.add_product_button"
                    className="gap-2 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-xl btn-glow"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>

                {productsQuery.isLoading ? (
                  <div className="grid gap-3">
                    {(["p1", "p2", "p3"] as const).map((k) => (
                      <Skeleton key={k} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div
                    className="bg-card rounded-2xl border border-border shadow-card py-16 text-center"
                    data-ocid="products.empty_state"
                  >
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground mb-1">
                      No products yet
                    </p>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Add your first product to get started.
                    </p>
                    <Button
                      onClick={openAddDialog}
                      size="sm"
                      className="gap-2 bg-primary text-primary-foreground font-display font-semibold rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Product
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="grid gap-3">
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id.toString()}
                          layout
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="bg-card rounded-2xl border border-border shadow-card p-4 flex items-center gap-4"
                          data-ocid={`products.item.${index + 1}`}
                        >
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-foreground line-clamp-1">
                              {product.name}
                            </p>
                            <p className="font-body text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {product.description}
                            </p>
                            <span className="inline-block mt-1.5 text-xs font-display font-bold text-primary">
                              ₹{Number(product.price).toFixed(2)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              data-ocid={`admin.edit_button.${index + 1}`}
                              className="gap-1.5 font-body text-xs border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all h-8 px-3"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(product)}
                              data-ocid={`admin.delete_button.${index + 1}`}
                              className="gap-1.5 font-body text-xs border-border hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive transition-all h-8 px-3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <footer className="border-t border-border bg-card py-6 mt-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
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

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={productDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeProductDialog();
        }}
      >
        <DialogContent
          className="sm:max-w-lg rounded-2xl bg-card"
          data-ocid="admin.add_product_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-name"
                className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prod-name"
                placeholder="e.g. Pro Wireless Headphones"
                value={productForm.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="font-body rounded-xl h-11"
                data-ocid="admin.product_name_input"
              />
              {formErrors.name && (
                <p className="text-destructive text-xs font-body">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-desc"
                className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prod-desc"
                placeholder="Brief description of the product..."
                value={productForm.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="font-body rounded-xl resize-none"
                rows={3}
                data-ocid="admin.product_desc_input"
              />
              {formErrors.description && (
                <p className="text-destructive text-xs font-body">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-price"
                className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5"
              >
                <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="99.99"
                value={productForm.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="font-body rounded-xl h-11"
                data-ocid="admin.product_price_input"
              />
              {formErrors.price && (
                <p className="text-destructive text-xs font-body">
                  {formErrors.price}
                </p>
              )}
            </div>

            {/* Product Image — dual mode picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Product Image
                </Label>
                {/* Mode toggle */}
                <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("url");
                      setUploadedFileName("");
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-display font-semibold transition-all ${
                      imageMode === "url"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link className="w-3 h-3" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("upload");
                      updateField("imageUrl", "");
                      setUploadedFileName("");
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-display font-semibold transition-all ${
                      imageMode === "upload"
                        ? "bg-card shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    Upload
                  </button>
                </div>
              </div>

              {imageMode === "url" ? (
                <Input
                  id="prod-image"
                  placeholder="https://example.com/image.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  className="font-body rounded-xl h-11"
                  data-ocid="admin.product_image_input"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {/* Hidden native file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-ocid="admin.product_image_dropzone"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    data-ocid="admin.product_image_upload_button"
                    className="gap-2 font-body text-sm rounded-xl h-11 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {uploadedFileName ? (
                    <span className="font-body text-xs text-foreground truncate min-w-0 flex-1 bg-muted px-3 py-2 rounded-xl">
                      {uploadedFileName}
                    </span>
                  ) : (
                    <span className="font-body text-xs text-muted-foreground truncate">
                      No file chosen
                    </span>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {productForm.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl overflow-hidden border border-border h-32 bg-muted"
                >
                  <img
                    src={productForm.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={closeProductDialog}
              className="font-display font-semibold rounded-xl flex-1 border-border"
              data-ocid="admin.add_product_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProductSave}
              disabled={isSaving}
              data-ocid="admin.product_save_button"
              className="bg-primary text-primary-foreground font-display font-semibold rounded-xl flex-1 btn-glow"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingProduct ? "Saving..." : "Adding..."}
                </>
              ) : editingProduct ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className="rounded-2xl bg-card sm:max-w-md"
          data-ocid="admin.delete_dialog"
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle className="font-display font-bold text-xl text-foreground">
                Delete Product?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="font-body text-sm text-muted-foreground leading-relaxed">
              You're about to delete{" "}
              <strong className="text-foreground">
                {deletingProduct?.name}
              </strong>
              . This action cannot be undone and the product will be removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              data-ocid="admin.delete_cancel_button"
              className="font-display font-semibold rounded-xl flex-1 border-border"
              disabled={deleteProduct.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProduct.isPending}
              data-ocid="admin.delete_confirm_button"
              className="font-display font-semibold rounded-xl flex-1"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
