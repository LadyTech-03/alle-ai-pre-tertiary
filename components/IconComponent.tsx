"use client";

import * as Icons from "lucide-react";
import { IconName } from "@/lib/types";

interface IconComponentProps {
  name: IconName;
  className?: string;
}

export function IconComponent({ name, className = "" }: IconComponentProps) {
  const IconMap = {
    Settings: Icons.Settings,
    BriefcaseBusiness: Icons.Briefcase,
    Code: Icons.Code,
    MessageCircleMore: Icons.MessageCircle,
    FolderCog: Icons.FolderCog,
    Users: Icons.Users,
    Building2: Icons.Building2,
    AlertTriangle: Icons.AlertTriangle,
    Clock: Icons.Clock,
    ChevronRight: Icons.ChevronRight,
    Search: Icons.Search,
    ArrowLeft: Icons.ArrowLeft,
    ThumbsUp: Icons.ThumbsUp,
    ThumbsDown: Icons.ThumbsDown,
    FlagTriangle: Icons.Rocket,
  };

  const Icon = IconMap[name];
  return Icon ? <Icon className={className} /> : null;
}