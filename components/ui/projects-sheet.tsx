import { useProjectStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStreamingTitlesStore } from "@/stores";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { Input } from "./input";
import { ChevronRight, SearchX, Clock, Plus, EllipsisVertical, Pencil, Trash2, Loader, Check, X } from "lucide-react";
import { BsFolder2Open } from "react-icons/bs";
import { TextStream } from "@/components/ui/text-stream";
import { Button } from "./button";
import { Project as StoreProject } from "@/stores";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { projectApi } from "@/lib/api/project";
import { toast } from "sonner";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTabValue?: string;
  }

export function ProjectsListModal({ isOpen, onClose }: ModalProps) {
  const { projects, setCurrentProject, updateProject, removeProject, currentProject } = useProjectStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { streamingTitles } = useStreamingTitlesStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Handle project click
  const handleProjectClick = (project: StoreProject) => {
    setCurrentProject(project);
    router.push(`/project/${project.uuid}`);
    onClose();
  };

  // Handle project rename init
  const handleProjectRename = (uuid: string, currentName: string) => {
    setEditingProjectId(uuid);
    setEditingProjectName(currentName);
  };

  // Submit project rename
  const handleProjectRenameSubmit = async (uuid: string) => {
    if (editingProjectName.trim() && editingProjectName !== projects.find(p => p.uuid === uuid)?.name) {
      try {
        setRenamingProjectId(uuid);
        const { startStreamingTitle, stopStreamingTitle } = useStreamingTitlesStore.getState();
        startStreamingTitle(`project-${uuid}`);
        const response = await projectApi.renameProject(uuid, editingProjectName.trim());
        if (response) {
          updateProject(uuid, { name: editingProjectName.trim() });
          toast.success('Project renamed');
          setTimeout(() => {
            stopStreamingTitle(`project-${uuid}`);
          }, 800);
          setEditingProjectId(null);
          setEditingProjectName("");
        }
      } catch (error: any) {
        // console.error('Error renaming project:', error);
        // toast.error(error.response.data.error || error.response.data.message || 'Failed to rename project');
        setEditingProjectId(uuid);
      } finally {
        setRenamingProjectId(null);
      }
    } else {
      setEditingProjectId(null);
      setEditingProjectName("");
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectUuid: string) => {
    try {
      setDeletingProjectId(projectUuid);
      const response = await projectApi.deleteProject(projectUuid);
      if (response) {
        removeProject(projectUuid);
        toast.success('Project deleted');
        if (currentProject?.uuid === projectUuid) {
          router.push('/chat');
        }
      }
    } catch (error: any) {
      // toast.error(error.response.data.error || error.response.data.message || 'Failed to delete project');
    } finally {
      setDeletingProjectId(null);
      setProjectToDelete(null);
    }
  };

  // Filter projects based on search and reverse order so newest appears first
  const filteredProjects = useMemo(() => {
    // Start with a copy of projects to avoid mutating the original
    let projectsList = [...projects];
    
    // Apply filter if search query exists
    if (searchQuery.trim()) {
      return projectsList.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return projectsList;
  }, [projects, searchQuery]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-full sm:max-w-md flex flex-col h-full bg-gradient-to-b from-background to-background/80 backdrop-blur-sm"
      >
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Projects</SheetTitle>
          </div>
          <div className="relative">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-secondary/50 border border-borderColorPrimary rounded-md focus-visible:outline-none"
            />
            <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </SheetHeader>

        <AnimatePresence>
          <motion.div 
            className="flex-1 overflow-y-auto pr-2 -mr-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleProjectClick(project)}
                    className="group relative flex items-center gap-3 p-2 rounded-xl hover:bg-secondary cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div 
                      className="p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${project.color || ''}15` }}
                    >
                      <BsFolder2Open 
                        className="h-5 w-5" 
                        style={{ color: project.color || '' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        {editingProjectId === project.uuid ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingProjectName}
                              onChange={(e) => setEditingProjectName(e.target.value)}
                              onKeyDown={(e) => {
                                if ((e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
                                  e.stopPropagation();
                                  handleProjectRenameSubmit(project.uuid);
                                }
                              }}
                              autoFocus
                              className="h-7 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {renamingProjectId === project.uuid ? (
                              <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => { e.stopPropagation(); handleProjectRenameSubmit(project.uuid); }}
                                  aria-label="Confirm Rename"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => { e.stopPropagation(); setEditingProjectId(null); setEditingProjectName(""); }}
                                  aria-label="Cancel Rename"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                        <TextStream 
                          text={project.name} 
                          className="font-semibold truncate text-foreground/90"
                          isStreaming={streamingTitles[`project-${project.uuid}`] || false}
                          streamDuration={800}
                        />
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Last updated {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {editingProjectId !== project.uuid && (
                      <div className="ml-auto">
                        {renamingProjectId === project.uuid ? (
                          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0 border-none outline-none bg-transparent hover:bg-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="More Actions"
                                >
                                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl bg-backgroundSecondary">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProjectRename(project.uuid, project.name); }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span className="text-sm">Rename</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-borderColorPrimary" />
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.uuid); }}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span className="text-sm">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  {searchQuery ? 'No matches found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery ? 
                    'Try adjusting your search terms' : 
                    'Create your first project to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('open-project-modal'));
                      }, 100);
                    }}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </SheetContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingProjectId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:opacity-70"
              disabled={!!deletingProjectId}
            >
              {deletingProjectId ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}