"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  User, 
  Building2, 
  Users, 
  Folders,
  CreditCard,
  Gauge,
  Key,
  ShieldCheck,
  ScrollText,
  Lock,
  MoreVertical,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Power,
  PowerOff,
  Ban,
  Loader,
  RefreshCw
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useApiKeyStore, ApiKey } from "@/stores";
import { CreateApiKeyModal, EditApiKeyModal, PromptModalProps } from "@/components/ui/modals";
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptModal } from "@/components/ui/modals";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ApiKeyData, keysApi } from "@/lib/api/keys";
import { useAuthStore } from "@/stores";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const settingsSections = [
  {
    title: "Organization",
    items: [
      { label: "Profile", href: "/developer/settings/profile", icon: User },
      { label: "Organization", href: "/developer/settings/organization", icon: Building2 },
      { label: "Members", href: "/developer/settings/members", icon: Users },
      { label: "Workspaces", href: "/developer/settings/workspaces", icon: Folders },
    ]
  },
  {
    title: "Billing",
    items: [
      { label: "Billing", href: "/developer/settings/billing", icon: CreditCard },
      { label: "Limits", href: "/developer/settings/limits", icon: Gauge },
    ]
  },
  {
    title: "Security",
    items: [
      { label: "API keys", href: "/developer/settings/api-keys", icon: Key, active: true },
      { label: "Admin keys", href: "/developer/settings/admin-keys", icon: ShieldCheck },
      { label: "Logs", href: "/developer/settings/logs", icon: ScrollText },
      { label: "Privacy", href: "/developer/settings/privacy", icon: Lock },
    ]
  }
];

export function CreateApiKeys() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<{ id: string; name: string } | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptConfig, setPromptConfig] = useState<PromptModalProps | null>(null);
  const { keys, addKey, removeKey, toggleKeyStatus, clearKeys, toggleKeyVisibility } = useApiKeyStore();
  ;
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await keysApi.getAllApiKeys();
      // console.log('Fetched API keys:', response);

      // Clear all existing keys first
      clearKeys();

      // Add new keys
      response.forEach((apiKey: ApiKeyData) => {
        addKey({
          id: apiKey.id.toString(),
          name: apiKey.name,
          key: apiKey.key,
          workspace: "default",
          isVisible: false,
          isDisabled: apiKey.active === 0,
          createdAt: apiKey.created_at,
          lastUsed: apiKey.last_used_at,
          createdBy: user?.first_name ? `${user.first_name}` : "You",
          email: user?.email || "your@email.com",
          cost: "$0.00"
        });
      });

    } catch (error) {
      // console.error('Error fetching API keys:', error);
      // toast.error('Failed to load keys')
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch on mount if there are no keys
  useEffect(() => {
    if (keys.length === 0) {
      fetchApiKeys();
    }
  }, []); // Empty dependency array for mount only

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied')
    } catch (err) {
      toast.error('Failed to copy')
    }
  };

  const handleDeleteKey = async (key: ApiKey) => {
    setDeletingKeys(prev => new Set(prev).add(key.id));
    try {
      const response = await keysApi.deleteApiKey(key.id);
      // console.log('Delete response:', response);
      
      if (response.deleted_at) {
        removeKey(key.id);
        toast.success(`${response.message}`)
      
      } else {
        toast.error('Failed to delete key');
      }
      
    } catch (error) {
      // console.error('Error deleting API key:', error);
      // toast.success('Failed to delete key')
    } finally {
      setDeletingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.id);
        return newSet;
      });
    }
  };

  const handleToggleStatus = async (key: ApiKey) => {
    setTogglingKeys(prev => new Set(prev).add(key.id));
    try {
      const response = key.isDisabled 
        ? await keysApi.enableApiKey(key.id)
        : await keysApi.disableApiKey(key.id);

      // Pass both id and the isDisabled state based on !response.active
      toggleKeyStatus(key.id, !response.active);
  
      toast.success(`${response.message}`)
    } catch (error) {
      // console.error('Error toggling API key status:', error);
      // toast.error(`Failed to ${key.isDisabled ? 'enable' : 'disable'} API key`)
    } finally {
      setTogglingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.id);
        return newSet;
      });
    }
  };

  const handleShowTogglePrompt = (key: ApiKey) => {
    setPromptConfig({
      isOpen: true,
      title: `${key.isDisabled ? 'Enable' : 'Disable'} API Key`,
      message: `Are you sure you want to ${key.isDisabled ? 'enable' : 'disable'} this API key?`,
      type: "warning",
      onClose: () => setPromptConfig(null),
      actions: [
        {
          label: "Cancel",
          onClick: () => setPromptConfig(null),
          variant: "outline"
        },
        {
          label: key.isDisabled ? "Enable" : "Disable",
          onClick: () => {
            handleToggleStatus(key);
            setPromptConfig(null);
          },
          variant: key.isDisabled ? "default" : "destructive"
        }
      ]
    });
    setShowPromptModal(true);
  };

  const handleShowDeletePrompt = (key: ApiKey) => {
    setPromptConfig({
      isOpen: true,
      title: "Delete API Key",
      message: `Are you sure you want to delete the API key "${key.name}"? This action cannot be undone.`,
      type: "warning",
      onClose: () => setPromptConfig(null),
      actions: [
        {
          label: "Cancel",
          onClick: () => setPromptConfig(null),
          variant: "outline"
        },
        {
          label: "Delete",
          onClick: () => {
            handleDeleteKey(key);
            setPromptConfig(null);
          },
          variant: "destructive"
        }
      ]
    });
    setShowPromptModal(true);
  };

  // Add loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="border-borderColorPrimary bg-backgroundSecondary">
      <div className="p-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-borderColorPrimary">
              <TableHead className="text-muted-foreground">NAME</TableHead>
              <TableHead className="text-muted-foreground">API KEY</TableHead>
              <TableHead className="text-muted-foreground">CREATED BY</TableHead>
              <TableHead className="text-muted-foreground">CREATED AT</TableHead>
              <TableHead className="text-muted-foreground">LAST USED</TableHead>
              <TableHead className="text-muted-foreground">COST</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, index) => (
              <TableRow key={index} className="hover:bg-hoverColorPrimary border-borderColorPrimary">
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-start mb-8"
        >
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-foreground mb-2">API keys</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Keep your API keys secure - don&apos;t commit them to version control or share them in public places.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={fetchApiKeys}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            {keys.length > 0 && (
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Key className="h-4 w-4" />
                Create Key
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : keys.length === 0 ? (
            <Card className="border-borderColorPrimary bg-backgroundSecondary p-12 text-center">
              <div className="mx-auto w-fit p-4 rounded-full bg-primary/10 mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Create an API key to integrate with the Alle-AI API.
              </p>
              <Button 
                className="gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Key className="h-4 w-4" />
                Create API Key
              </Button>
            </Card>
          ) : (
            <Card className="border-borderColorPrimary bg-backgroundSecondary">
              <div className="p-1">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-borderColorPrimary">
                      <TableHead className="text-muted-foreground">NAME</TableHead>
                      <TableHead className="text-muted-foreground">API KEY</TableHead>
                      {/* <TableHead className="text-muted-foreground">WORKSPACE</TableHead> */}
                      <TableHead className="text-muted-foreground">CREATED BY</TableHead>
                      <TableHead className="text-muted-foreground">CREATED AT</TableHead>
                      <TableHead className="text-muted-foreground">LAST USED</TableHead>
                      <TableHead className="text-muted-foreground">COST</TableHead>
                      <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.name} className="hover:bg-hoverColorPrimary border-borderColorPrimary">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-foreground",
                              key.isDisabled && "text-muted-foreground line-through"
                            )}>
                              {key.name}
                            </span>
                            {key.isDisabled && (
                              <Ban className="w-4 h-4 text-red-500"/>
                            )}
                            {deletingKeys.has(key.id) && (
                              <Loader className="h-4 w-4 animate-spin text-primary"/>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-mono">
                              {key.isVisible ? key.key : key.key.replace(/(?<=^.{8}).*(?=.{4}$)/g, '•'.repeat(12))}
                            </span>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => toggleKeyVisibility(key.id)}
                                  >
                                    {key.isVisible ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {key.isVisible ? 'Hide API key' : 'Show API key'}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copyToClipboard(key.key, key.name)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy API key</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                            {key.workspace}
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground">{key.createdBy}</span>
                            <span className="text-sm text-muted-foreground">{key.email}</span>
                          </div>
                        </TableCell>
                        <TableCell title={`${format(new Date(key.createdAt), "MMMM d, yyyy h:mm a")}`}>{format(new Date(key.createdAt), "dd'/'MM'/'yy h:mm a")}</TableCell>
                        <TableCell>{key.lastUsed}</TableCell>
                        <TableCell>{key.cost}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover:bg-background/50"
                                disabled={deletingKeys.has(key.id)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingKey({ id: key.id, name: key.name })}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Name
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShowTogglePrompt(key)}
                                disabled={deletingKeys.has(key.id)}
                              >
                                {deletingKeys.has(key.id) ? (
                                  <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    {key.isDisabled ? "Enabling..." : "Disabling..."}
                                  </>
                                ) : key.isDisabled ? (
                                  <>
                                    <Power className="h-4 w-4 mr-2" />
                                    Enable Key
                                  </>
                                ) : (
                                  <>
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Disable Key
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleShowDeletePrompt(key)}
                                disabled={deletingKeys.has(key.id)}
                              >
                                {deletingKeys.has(key.id) ? (
                                  <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Key
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-backgroundSecondary/50 p-4 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <p className="leading-relaxed">
            Your API keys carry many privileges. Keep them secure! Don&apos;t share your API key in publicly accessible areas such as GitHub, 
            client-side code, and so forth.
          </p>
        </motion.div>
      </motion.div>

      <CreateApiKeyModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      {editingKey && (
        <EditApiKeyModal
          isOpen={true}
          onClose={() => setEditingKey(null)}
          keyId={editingKey.id}
          initialName={editingKey.name}
        />
      )}

      {showPromptModal && promptConfig && (
        <PromptModal
          isOpen={promptConfig.isOpen}
          onClose={() => {
            setShowPromptModal(false);
            setPromptConfig(null);
          }}
          title={promptConfig.title}
          message={promptConfig.message}
          type={promptConfig.type}
          actions={promptConfig.actions}
        />
      )}
    </TooltipProvider>
  );
}