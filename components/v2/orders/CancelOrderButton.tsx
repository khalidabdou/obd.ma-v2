"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/order.service";

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelOrder = async () => {
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      toast({ title: "Order cancelled" });
      router.refresh();
    } catch (error: unknown) {
      const response = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { data?: { error?: string; message?: string }; message?: string } } }).response?.data
        : undefined;
      const message = response?.data?.error ?? response?.data?.message ?? response?.message;
      toast({
        title: "Could not cancel order",
        description: message || "Please try again. The order may no longer be eligible for cancellation.",
        variant: "destructive",
      });
      router.refresh();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <X className="h-4 w-4" />
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your order will be cancelled and any eligible refund will be handled by the store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void cancelOrder();
            }}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
