"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Image from "next/image";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; className: string }) => Promise<void> | void;
  organizationName?: string;
  organizationLogo?: string;
}

export function SessionModal({
  isOpen,
  onClose,
  onSubmit,
  organizationName = "Organization",
  organizationLogo,
}: SessionModalProps) {
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !selectedClass) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), className: selectedClass });
      // Reset form
      setName("");
      setSelectedClass("");
      onClose();
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setSelectedClass("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 mb-4">
            {organizationLogo ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-borderColorPrimary">
                <Image
                  src={organizationLogo}
                  alt={organizationName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border border-borderColorPrimary">
                <span className="text-2xl font-bold text-muted-foreground">
                  {organizationName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <DialogTitle className="text-center">{organizationName}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-borderColorPrimary focus-visible:outline-none focus:border-2"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="class" className="text-sm font-medium">
              Class
            </label>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="class"
                className="border border-borderColorPrimary focus:border-2"
              >
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent className="bg-backgroundSecondary">
                {[1, 2, 3, 4, 5, 6].map((classNum) => (
                  <SelectItem
                    key={classNum}
                    value={`Class ${classNum}`}
                    className="cursor-pointer"
                  >
                    Class {classNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || !selectedClass || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Starting Session...
              </>
            ) : (
              "Start Session"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
