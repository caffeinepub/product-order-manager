import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Edit,
  Link,
  Loader2,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Category, Order, Product } from "../backend";
import {
  useAddCategory,
  useAddProduct,
  useDeleteCategory,
  useDeleteOrder,
  useDeleteProduct,
  useGetCategories,
  useGetOrders,
  useGetProducts,
  useUpdateProduct,
} from "../hooks/useQueries";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboardPage({ onLogout }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold">
            🏠 Tasty Home — Admin
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-white/20"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="products">
          <TabsList className="w-full mb-6 bg-muted">
            <TabsTrigger
              value="products"
              className="flex-1"
              data-ocid="admin.products.tab"
            >
              <Package className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex-1"
              data-ocid="admin.categories.tab"
            >
              <Tag className="h-4 w-4 mr-2" /> Categories
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex-1"
              data-ocid="admin.orders.tab"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProductsTab() {
  const { data: products = [], isLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setImageUrl("");
    setImageFile(null);
    setImageMode("url");
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setPrice(String(p.price));
    setImageUrl(p.image.getDirectURL() || "");
    setImageMode("url");
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("Name and price are required");
      return;
    }

    let image: ExternalBlob;
    if (imageMode === "file" && imageFile) {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      image = ExternalBlob.fromBytes(bytes);
    } else if (imageUrl.trim()) {
      image = ExternalBlob.fromURL(imageUrl.trim());
    } else {
      image = ExternalBlob.fromURL(
        "/assets/generated/product-groceries.dim_400x300.jpg",
      );
    }

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          name: name.trim(),
          description: description.trim(),
          category: category || categories[0]?.name || "General",
          image,
          price: BigInt(Math.round(Number(price))),
        });
        toast.success("Product updated!");
        setEditingProduct(null);
      } else {
        await addProductMutation.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          category: category || categories[0]?.name || "General",
          image,
          price: BigInt(Math.round(Number(price))),
        });
        toast.success("Product added!");
        setShowAddForm(false);
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
    }
  };

  const isPending =
    addProductMutation.isPending || updateProductMutation.isPending;
  const isEditing = !!editingProduct;
  const formVisible = showAddForm || isEditing;

  return (
    <div className="space-y-6">
      {!formVisible && (
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
            setEditingProduct(null);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      )}

      {formVisible && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Product Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mango Pickle"
                  className="mt-1"
                  data-ocid="admin.product.name.input"
                />
              </div>
              <div>
                <Label className="text-sm">Price (₹) *</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="mt-1"
                  data-ocid="admin.product.price.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="mt-1 resize-none"
                rows={2}
                data-ocid="admin.product.description.textarea"
              />
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="admin.product.category.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={String(c.id)} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Product Image</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Button
                  type="button"
                  variant={imageMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMode("url")}
                  className={
                    imageMode === "url"
                      ? "bg-primary text-primary-foreground"
                      : "border-primary/30 text-primary"
                  }
                >
                  <Link className="h-3.5 w-3.5 mr-1" /> URL
                </Button>
                <Button
                  type="button"
                  variant={imageMode === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMode("file")}
                  className={
                    imageMode === "file"
                      ? "bg-primary text-primary-foreground"
                      : "border-primary/30 text-primary"
                  }
                >
                  <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
              </div>
              {imageMode === "url" ? (
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  data-ocid="admin.product.image_url.input"
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  data-ocid="admin.product.upload_button"
                />
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isPending}
                data-ocid="admin.add_product.submit_button"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Add Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.products.empty_state"
        >
          <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductRow
              key={String(product.id)}
              product={product}
              onEdit={startEdit}
              onDelete={async () => {
                try {
                  await deleteProductMutation.mutateAsync(product.id);
                  toast.success("Product deleted");
                } catch {
                  toast.error("Failed to delete");
                }
              }}
              isDeleting={deleteProductMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  isDeleting,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const imageUrl = product.image.getDirectURL();
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
          🍱
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight line-clamp-1">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {product.category}
        </p>
        <p className="text-primary font-bold text-sm">
          ₹{Number(product.price)}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="border-primary/30 text-primary h-8 px-2"
          onClick={() => onEdit(product)}
          data-ocid="admin.edit_product.button"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/30 text-destructive h-8 px-2"
          onClick={onDelete}
          disabled={isDeleting}
          data-ocid="admin.delete_product.button"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories = [], isLoading } = useGetCategories();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await addCategoryMutation.mutateAsync({ name: newCategory.trim() });
      toast.success("Category added!");
      setNewCategory("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to add category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-heading text-lg font-semibold mb-4">
          Add Category
        </h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Spices"
            className="flex-1"
            data-ocid="admin.category.name.input"
          />
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={addCategoryMutation.isPending}
            data-ocid="admin.add_category.submit_button"
          >
            {addCategoryMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.categories.empty_state"
        >
          <Tag className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>No categories yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <CategoryRow
              key={String(cat.id)}
              category={cat}
              onDelete={async () => {
                try {
                  await deleteCategoryMutation.mutateAsync(cat.id);
                  toast.success("Category deleted");
                } catch {
                  toast.error("Failed to delete");
                }
              }}
              isDeleting={deleteCategoryMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onDelete,
  isDeleting,
}: {
  category: Category;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <span className="font-medium">{category.name}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-destructive/30 text-destructive h-8 px-2"
        onClick={onDelete}
        disabled={isDeleting}
        data-ocid="admin.delete_category.button"
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useGetOrders();
  const deleteOrderMutation = useDeleteOrder();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.orders.empty_state"
        >
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-heading text-lg">No orders yet</p>
          <p className="text-sm mt-1">
            Orders will appear here once customers place them
          </p>
        </div>
      ) : (
        orders.map((order) => (
          <OrderRow
            key={String(order.id)}
            order={order}
            onDelete={async () => {
              try {
                await deleteOrderMutation.mutateAsync(order.id);
                toast.success("Order deleted");
              } catch {
                toast.error("Failed to delete order");
              }
            }}
            isDeleting={deleteOrderMutation.isPending}
          />
        ))
      )}
    </div>
  );
}

function OrderRow({
  order,
  onDelete,
  isDeleting,
}: {
  order: Order;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const date = new Date(Number(order.timestamp) / 1_000_000);
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-semibold">
              {order.customerName}
            </span>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-xs"
            >
              #{String(order.id)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
            <span>📞 {order.contactNumber}</span>
            {order.city && <span>📍 {order.city}</span>}
            <span>
              🕒 {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/30 text-destructive flex-shrink-0"
          onClick={onDelete}
          disabled={isDeleting}
          data-ocid="admin.delete_order.button"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <Separator className="my-3" />
      <div className="space-y-1">
        {order.items.map((item) => (
          <div
            key={String(item.productId)}
            className="flex justify-between text-sm"
          >
            <span>
              {item.productName}{" "}
              <span className="text-muted-foreground">
                ×{Number(item.quantity)}
              </span>
            </span>
            <span className="font-medium">
              ₹{Number(item.price) * Number(item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-heading font-bold text-primary text-lg">
          ₹{Number(order.totalAmount)}
        </span>
      </div>
    </div>
  );
}
