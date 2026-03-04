import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Product } from "../backend.d";
import { useActor } from "./useActor";

const ADMIN_PIN = "0852";

export function useListProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders(ADMIN_PIN);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyAdminPin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error("No actor");
      return actor.verifyAdminPin(pin);
    },
  });
}

export function useSubmitOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      productId,
      productName,
      customerName,
      contactNumber,
      cityName,
    }: {
      productId: bigint;
      productName: string;
      customerName: string;
      contactNumber: string;
      cityName?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitOrder(
        productId,
        productName,
        customerName,
        contactNumber,
        cityName ?? "",
      );
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      imageUrl,
    }: {
      name: string;
      description: string;
      price: number;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addProduct(ADMIN_PIN, name, description, price, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      price,
      imageUrl,
    }: {
      id: bigint;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.editProduct(
        ADMIN_PIN,
        id,
        name,
        description,
        price,
        imageUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(ADMIN_PIN, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
