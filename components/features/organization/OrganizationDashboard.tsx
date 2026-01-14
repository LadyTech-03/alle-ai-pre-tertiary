"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { AlleAILoader } from "@/components/features/AlleAILoader";
import { 
  Building2, 
  Users, 
  Settings, 
  CreditCard, 
  Search, 
  Plus,
  Download,
  X,
  Shield,
  MoreVertical,
  Loader
} from "lucide-react";
import { toast } from "sonner"

import { MembersTable } from "./MembersTable";
import { AddMembersModal } from "@/components/ui/modals";

interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'suspended';
}

interface OrganizationDetails {
  id: string;
  name: string;
  members: OrganizationMember[];
  plan: string;
  seats: number;
  usedSeats: number;
}

export function OrganizationDashboard() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  ;
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

  useEffect(() => {
    // Replace with your actual API call
    const fetchOrgDetails = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOrgDetails({
          id: params.id as string,
          name: 'KNUST',
          plan: 'Business',
          seats: 450,
          usedSeats: 300,
          members: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@acme.com',
              role: 'admin',
              joinedAt: '2024-01-15',
              status: 'active'
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@acme.com',
              role: 'member',
              joinedAt: '2024-02-01',
              status: 'suspended'
            },
          ]
        });
      } catch (error) {
        toast.error('Faild to load organization details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [params.id, toast]);

  if (isLoading) {
    return (
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex items-center justify-center"
    >
      <AlleAILoader size="md" />
    </motion.div>
    );
  }

  if (!orgDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Organization not found</h2>
          <p className="text-muted-foreground">
            The organization you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }} 
            className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }} 
              className="text-2xl font-bold">{orgDetails.name}</motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }} className="text-muted-foreground">
              {orgDetails.plan} Plan · {orgDetails.usedSeats}/{orgDetails.seats} seats used
            </motion.p>
          </div>
        </div>
        <Button onClick={() => setIsAddMembersModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Members List */}
          <MembersTable data={orgDetails.members} />
        </TabsContent>

        <TabsContent value="settings">
          {/* Add your settings content here */}
        </TabsContent>

        <TabsContent value="billing">
          {/* Add your billing content here */}
        </TabsContent>
      </Tabs>

      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
      />
    </motion.div>
  );
}