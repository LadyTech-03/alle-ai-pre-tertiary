"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Rocket, CreditCard, Plus, Trash2, Loader, RefreshCw, MoreVertical, Check } from "lucide-react";
import { BuyCreditsModal, CardPaymentMethodModal, PromptModal, AutoReloadModal } from "@/components/ui/modals";
import { useCreditsStore, usePaymentStore } from "@/stores";
import { toast } from "sonner"
import { paymentApi } from "@/lib/api/payment";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoReloadStore } from "@/stores";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { motion } from "framer-motion";


export function BillingContent() {
  const [isPaymentOptionsOpen, setIsPaymentOptionsOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isAutoReloadOpen, setIsAutoReloadOpen] = useState(false);
  const { balance, fetching } = useCreditsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { settings: autoReloadSettings } = useAutoReloadStore();

  const [deletePrompt, setDeletePrompt] = useState<{
    isOpen: boolean;
    methodId: string | null;
  }>({
    isOpen: false,
    methodId: null
  });
  const { paymentMethods, removePaymentMethod, setDefaultPaymentMethod, setPaymentMethods } = usePaymentStore();

  // Reusable function to fetch payment methods with default status
  const fetchPaymentMethodsWithDefault = async () => {
    try {
      const [creditResponse, defaultResponse] = await Promise.all([
        paymentApi.getCreditDetails(),
        paymentApi.getDefaultPaymentMethod().catch(() => ({ status: false, payment_method: null }))
      ]);

      if (Array.isArray(creditResponse.payment_methods)) {
        let defaultPaymentMethodId: string | null = null;
        if (defaultResponse.status && defaultResponse.payment_method) {
          defaultPaymentMethodId = defaultResponse.payment_method.id;
        }

        const updatedMethods = creditResponse.payment_methods.map((method) => ({
          id: `pm_${method.id}`,
          c_id: method.id,
          type: 'card' as const,
          lastFour: method.last4,
          expiryDate: `${method.exp_month}/${method.exp_year}`,
          cardBrand: method.brand as any,
          isDefault: method.id === defaultPaymentMethodId
        }));
        
        setPaymentMethods(updatedMethods);
        return true;
      } else {
        setPaymentMethods([]);
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return false;
    }
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    setDeletePrompt({
      isOpen: true,
      methodId
    });
  };

  const handleSetDefaultPaymentMethod = async (methodId: string, c_id: string) => {
    try {
      setIsSettingDefault(true);
      // console.log('setting default payment method on billing-content area', c_id);
      
      // Call the backend API
      const response = await paymentApi.setDefaultPaymentMethod(c_id);
      // console.log('response from set default payment method on billing-content area', response);
      
      if (response.status) {
        // Refetch payment methods from server to get the correct default status
        const success = await fetchPaymentMethodsWithDefault();
        if (success) {
          toast.success("Default payment method updated");
        } else {
          // Fallback to local update if refetch fails
          setDefaultPaymentMethod(methodId);
          toast.success("Default payment method updated");
        }
      } else {
        // toast.error("Failed to update default payment method");
      }
    } catch (error: any) {
      // console.error("Error setting default payment method:", error);
      // toast.error("Failed to update default payment method");
    } finally {
      setIsSettingDefault(false);
    }
  };

  // Get auto-reload payment method details if available
  const autoReloadPaymentMethod = autoReloadSettings?.payment_method_id 
    ? paymentMethods.find(m => m.c_id === autoReloadSettings.payment_method_id) 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Alert */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-backgroundSecondary text-muted-foreground px-6 py-4 rounded-lg mb-8 backdrop-blur-sm border border-borderColorPrimary"
      >
        <p>To get started with the Alle-AI API, purchase some credits.</p>
      </motion.div>

      {/* Credit Balance Section */}
      <div className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold mb-3"
        >
          Credit balance
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8"
        >
          Your credit balance will be consumed with API and Workbench usage. You can add funds directly or set up auto-reload thresholds.
        </motion.p>

        <div className="grid gap-6">
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-backgroundSecondary to-background border-borderColorPrimary overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                    {fetching ? (
                      <Skeleton className="h-12 w-32" />
                    ) : (
                      <span className="text-5xl font-bold tracking-tight">£{balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>
                </div>

                {autoReloadSettings?.enabled && !fetching && (
                  <div className="bg-primary/10 p-3 rounded-md mb-4 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <p className="text-sm">
                      Auto-reload: £{autoReloadSettings.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })} will be added when balance falls below £{autoReloadSettings.threshold.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      {autoReloadPaymentMethod && (
                        <span className="ml-1 text-muted-foreground">
                          using card ending in {autoReloadPaymentMethod.lastFour}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button 
                    className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsBuyCreditsOpen(true)}
                  >
                    Add Credits
                  </Button>
                  <Button 
                    variant="outline" 
                    className="transition-colors"
                    onClick={() => setIsAutoReloadOpen(true)}
                    disabled={paymentMethods.length === 0}
                  >
                    {autoReloadSettings?.enabled ? 'Update Auto-reload' : 'Set up Auto-reload'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment Methods Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Payment methods</h2>
                <p className="text-muted-foreground">
                  Add a payment method to enable automatic reloading of credits.
                </p>
              </div>
              {paymentMethods.length > 0 && !fetching && (
                <Button 
                    variant="outline" 
                    className="transition-colors"
                    onClick={() => setIsCardModalOpen(true)}
                >
                    Add Payment Method
                </Button>
              )}
            </div>

            {fetching ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <Card className="p-8 bg-backgroundSecondary/30 border-dashed border-2 border-borderColorPrimary/50">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">No payment methods</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Add a payment method to enable automatic payments and ensure uninterrupted access to the API.
                  </p>
                  <Button 
                    variant="outline" 
                    className="transition-colors"
                    onClick={() => setIsCardModalOpen(true)}
                  >
                    Add Payment Method
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {isRefreshing && (
                  <div className="flex items-center justify-center p-4">
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Updating payment methods...</span>
                  </div>
                )}
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="p-4 bg-backgroundSecondary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-backgroundSecondary rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">•••• •••• •••• {method.lastFour}</p>
                            {method.isDefault && (
                              <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                  Default
                                </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted"
                            disabled={isDeleting || isSettingDefault || isRefreshing}
                          >
                            {isDeleting || isSettingDefault || isRefreshing ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-backgroundSecondary"> 
                          {!method.isDefault && (
                            <DropdownMenuItem 
                              onClick={() => handleSetDefaultPaymentMethod(method.id, method.c_id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              <span>Set as Default</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-backgroundSecondary/30 border-borderColorPrimary/50 hover:border-primary/20 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Need enterprise features?</h3>
                      <p className="text-sm text-muted-foreground">
                        Contact the Alle-AI team for custom rate limits, monthly invoicing, and more.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="hover:bg-primary hover:text-white transition-colors ml-8"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <CardPaymentMethodModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        mode="add"
      />

      <BuyCreditsModal 
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />

      <AutoReloadModal
        isOpen={isAutoReloadOpen}
        onClose={() => setIsAutoReloadOpen(false)}
      />

      {/* Delete Confirmation Prompt */}
      <PromptModal
        isOpen={deletePrompt.isOpen}
        onClose={() => setDeletePrompt({ isOpen: false, methodId: null })}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
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
                try {
                  setIsDeleting(true);
                  // Find the payment method to get its c_id
                  const paymentMethod = paymentMethods.find(method => method.id === deletePrompt.methodId);
                  
                  if (paymentMethod) {
                    // Call the API with the c_id
                    const response = await paymentApi.removePaymentMethod(paymentMethod.c_id);
                    
                    if (response.status) {
                      // If successful, refetch payment methods from server
                      try {
                        setIsRefreshing(true);
                        const success = await fetchPaymentMethodsWithDefault();
                        if (success) {
                          toast.success("Payment method removed successfully");
                        } else {
                          // Fallback to local removal if refetch fails
                          removePaymentMethod(deletePrompt.methodId);
                          toast.success("Payment method removed successfully");
                        }
                      } catch (refetchError) {
                        // console.error("Error refetching payment methods:", refetchError);
                        // Fallback to local removal if refetch fails
                        removePaymentMethod(deletePrompt.methodId);
                        // toast.success("Payment method removed successfully");
                      } finally {
                        setIsRefreshing(false);
                      }
                    } else {
                      // toast.error("Failed to remove payment method");
                    }
                  }
                } catch (error) {
                  // console.error("Error removing payment method:", error);
                  // toast.error("Failed to remove payment method");
                } finally {
                  setIsDeleting(false);
                  setDeletePrompt({ isOpen: false, methodId: null });
                }
              }
            },
            variant: "destructive",
            disabled: isDeleting,
            icon: isDeleting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : undefined
          }
        ]}
      />
    </motion.div>
  );
}