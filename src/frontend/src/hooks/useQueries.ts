import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  CreateCategoryInput,
  CreateOrderInput,
  CreateProductInput,
  UpdateProductInput,
} from "../backend";
import { useActor } from "./useActor";

export function useGetProducts() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor,
  });
}

export function useGetCategories() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor,
  });
}

export function useGetOrders() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      if (!actor) throw new Error("Backend not connected. Please try again.");
      return actor.placeOrder(input);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["orders"] }),
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.addProduct(input);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.updateProduct(input);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.deleteProduct(id);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["products"] }),
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.addCategory(input);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.deleteCategory(id);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend not connected.");
      return actor.deleteOrder(id);
    },
    onSuccess: () => qc.refetchQueries({ queryKey: ["orders"] }),
  });
}

export { ExternalBlob };
