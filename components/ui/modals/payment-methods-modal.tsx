"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle, 
  CreditCard, 
  Plus, 
  Trash2, 
  Loader, 
  MoreVertical, 
  Check,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { paymentApi } from "@/lib/api/payment";
import { CardPaymentMethodModal } from "@/components/ui/modals";
import { PromptModal } from "@/components/ui/modals";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentMethodsModal({ isOpen, onClose }: PaymentMethodsModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState<{
    isOpen: boolean;
    methodId: string | null;
  }>({
    isOpen: false,
    methodId: null
  });

  const cardBrandLabel = (brand?: string) => brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';

  // Fetch payment methods with default status
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [creditResponse, defaultResponse] = await Promise.all([
        paymentApi.getCreditDetails(),
        paymentApi.getDefaultPaymentMethod().catch(() => ({ status: false, payment_method: null }))
      ]);

      if (Array.isArray(creditResponse.payment_methods)) {
        let defaultPaymentMethodId: string | null = null;
        if (defaultResponse.status && defaultResponse.payment_method) {
          defaultPaymentMethodId = defaultResponse.payment_method.id;
        }

        const methodsWithDefault = creditResponse.payment_methods.map((method) => ({
          ...method,
          isDefault: method.id === defaultPaymentMethodId
        }));
        
        setPaymentMethods(methodsWithDefault);
      } else {
        setPaymentMethods([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const handleDeletePaymentMethod = (methodId: string) => {
    setDeletePrompt({
      isOpen: true,
      methodId
    });
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      setIsSettingDefault(true);
      setError(null);
      
      const response = await paymentApi.setDefaultPaymentMethod(methodId);
      
      if (response.status) {
        // Refetch to get updated default status
        await fetchPaymentMethods();
        toast.success("Default payment method updated");
      } else {
        toast.error("Failed to update default payment method");
      }
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      toast.error("Failed to update default payment method");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await paymentApi.removePaymentMethod(methodId);
      
      if (response.status) {
        // Refetch to get updated list
        await fetchPaymentMethods();
        toast.success("Payment method removed successfully");
      } else {
        toast.error("Failed to remove payment method");
      }
    } catch (error: any) {
      console.error("Error removing payment method:", error);
      toast.error("Failed to remove payment method");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPaymentMethods();
    setIsRefreshing(false);
  };

  const handleClose = () => {
    setPaymentMethods([]);
    setError(null);
    setDeletePrompt({ isOpen: false, methodId: null });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-backgroundSecondary px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-semibold">Manage Payment Methods</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-4 py-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Getting payment methods
                  <Loader className="h-3 w-3 animate-spin" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-600">Error loading payment methods</div>
                    <div className="text-xs text-red-500 mt-1">{error}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchPaymentMethods}
                      className="mt-2 h-6 px-2 text-xs"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-6">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">No payment methods</p>
                <Button
                  onClick={() => setShowAddCardModal(true)}
                  size="sm"
                  className="h-7 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Payment Method
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between p-3 bg-backgroundSecondary/30 border border-borderColorPrimary rounded-md hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-backgroundSecondary rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {cardBrandLabel(method.brand)} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <Badge variant="default" className="text-xs px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-muted"
                            disabled={isDeleting || isSettingDefault || isRefreshing}
                          >
                            {isDeleting || isSettingDefault || isRefreshing ? (
                              <Loader className="h-3 w-3 animate-spin" />
                            ) : (
                              <MoreVertical className="h-3 w-3" />
                            )}
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-backgroundSecondary">
                          {!method.isDefault && (
                            <DropdownMenuItem 
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              disabled={isSettingDefault}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-2" />
                              <span>Set as Default</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 focus:text-red-500 text-xs"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            <span>Remove</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {paymentMethods.length > 0 && `${paymentMethods.length} payment method${paymentMethods.length !== 1 ? 's' : ''}`}
              </div>
              <div className="flex items-center gap-2">
                {paymentMethods.length > 0 && (
                  <Button 
                    onClick={() => setShowAddCardModal(true)}
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Modal */}
      <CardPaymentMethodModal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          fetchPaymentMethods(); // Refresh the list after adding
        }}
        mode="add"
      />

      {/* Delete Confirmation Modal */}
      <PromptModal
        isOpen={deletePrompt.isOpen}
        onClose={() => setDeletePrompt({ isOpen: false, methodId: null })}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone and may affect your subscription if it's the only payment method."
        type="warning"
        actions={[
          {
            label: "Cancel",
            onClick: () => setDeletePrompt({ isOpen: false, methodId: null }),
            variant: "outline"
          },
          {
            label: "Remove",
            onClick: async () => {
              if (deletePrompt.methodId && !isDeleting) {
                await handleRemovePaymentMethod(deletePrompt.methodId);
                setDeletePrompt({ isOpen: false, methodId: null });
              }
            },
            variant: "destructive",
            disabled: isDeleting,
            icon: isDeleting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : undefined
          }
        ]}
      />
    </>
  );
}
