"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, useHistoryStore, useModelsStore, useSidebarStore } from "@/stores";
import { projectApi } from "@/lib/api/project";
import { historyApi } from "@/lib/api/history";
import { modelsApi } from "@/lib/api/models";
import { Loader, MessageSquare, FileText, FolderOpen, LayoutGrid, List } from "lucide-react";
import { BsFolder2Open } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import GreetingMessage from "@/components/features/GreetingMessage";

const preferredOrder = ['gpt-4-5', 'o3-mini', 'deepseek-r1', 'grok-2-vision', 'o1', 'claude-3-5-sonnet', 'llama-3-1-70b-instruct', 'gpt-4o', 'claude-3-sonnet', 'grok-2', 'gemini-1-5-pro', 'llama-3-70b-instruct', 'deepseek-v3', 'mixtral-8x7b-instruct', 'gpt-4', 'o1-mini', 'phi-4'];

export default function ProjectsPage() {
  const router = useRouter();
  const { currentProject, projects, setCurrentProject, setProjects, setLoading, isLoading } = useProjectStore();
  const { setHistory, setLoading: setHistoryLoading } = useHistoryStore();
  const { chatModels, setChatModels, setLoading: setModelsLoading } = useModelsStore();
  const { isOpen } = useSidebarStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load chat models
  useEffect(() => {
    const loadChatModels = async () => {
      if (chatModels && chatModels.length > 0) return;

      setModelsLoading(true);
      try {
        const models = await modelsApi.getModels('chat');
        const sortedChatModels = models.sort((a, b) => {
          const indexA = preferredOrder.indexOf(a.model_uid);
          const indexB = preferredOrder.indexOf(b.model_uid);

          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }

          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          return 0;
        });
        setChatModels(sortedChatModels);
      } catch (err: any) {
        // Silently fail
      } finally {
        setModelsLoading(false);
      }
    };

    loadChatModels();
  }, [chatModels, setChatModels, setModelsLoading]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      if (projects.length > 0) {
        setIsInitialLoading(false);
        return;
      }

      setLoading(true);
      try {
        const projectsData = await projectApi.getProjects();

        if (Array.isArray(projectsData) && projectsData.length > 0) {
          const formattedProjects = projectsData.map(project => {
            const formattedProject = {
              id: project.id.toString(),
              uuid: project.uuid.toString(),
              name: project.name,
              description: project.description || "",
              files: [],
              histories: [],
              instructions: project.instructions || "",
              createdAt: project.created_at ? new Date(project.created_at) : new Date(),
              color: project.color_code || undefined,
            };

            if ((project as any).history && Array.isArray((project as any).history)) {
              formattedProject.histories = (project as any).history.map((h: any) => ({
                id: h.uuid,
                session: h.uuid,
                title: h.title || "New Chat",
                type: 'chat' as const,
                created_at: h.created_at,
                updated_at: h.updated_at,
              }));
            }

            return formattedProject;
          });

          setProjects(formattedProjects);

          // Load conversations for projects that don't have histories
          for (const project of formattedProjects) {
            if (!project.histories || project.histories.length === 0) {
              try {
                const conversations = await projectApi.getProjectConversations(project.uuid);
                if (Array.isArray(conversations) && conversations.length > 0) {
                  const formattedConversations = conversations.map(conv => ({
                    id: conv.session,
                    session: conv.session,
                    title: conv.title,
                    type: 'chat' as const,
                    created_at: conv.created_at,
                    updated_at: conv.updated_at,
                  }));

                  const { updateProject } = useProjectStore.getState();
                  updateProject(project.uuid, { histories: formattedConversations });
                }
              } catch (err: any) {
                // Continue with other projects even if one fails
              }
            }
          }
        }
      } catch (error: any) {
        // Silently fail
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadProjects();
  }, [projects.length, setProjects, setLoading]);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      const { getHistoryByType } = useHistoryStore.getState();
      const chatHistory = getHistoryByType('chat');
      if (chatHistory && chatHistory.length > 0) {
        return;
      }

      setHistoryLoading(true);
      try {
        const response = await historyApi.getHistory('chat');
        setHistory(response.data);
      } catch (err: any) {
        // Silently fail
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [setHistory, setHistoryLoading]);

  // Redirect if current project exists
  useEffect(() => {
    if (currentProject && !isInitialLoading) {
      router.push(`/project/${currentProject.uuid}`);
    }
  }, [currentProject, router, isInitialLoading]);

  const handleProjectClick = (project: typeof projects[0]) => {
    setCurrentProject(project);
    router.push(`/project/${project.uuid}`);
  };

  if (isInitialLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full p-4 mb-4 bg-muted inline-flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">No projects yet</h1>
          <p className="text-sm text-muted-foreground">
            Choose a project from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
        {/* Scrollable Projects Container with Fade Effect */}
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
              {/* Greeting Message Component */}
              <div className="w-full max-w-5xl mb-8">
                <GreetingMessage
                  questionText="Select a Subject to continue"
                />
              </div>

              {/* View Toggle */}
              <div className="w-full max-w-4xl mb-6 flex items-center justify-end">
                <div className="flex items-center gap-2 border border-borderColorPrimary rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Projects Grid or List */}
              <div className="w-full max-w-5xl pb-24">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {projects.map((project) => {
                      const conversationCount = project.histories?.length || 0;
                      const fileCount = project.files?.length || 0;
                      const projectColor = project.color || "";

                      return (
                        <div
                          key={project.uuid}
                          onClick={() => handleProjectClick(project)}
                          className="group bg-backgroundSecondary border border-border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-borderColorPrimary hover:shadow-sm"
                        >
                          {/* Card Header with colored strip */}
                          <div
                            className="h-1 w-full"
                            // style={{ backgroundColor: projectColor }}
                          />

                          {/* Card Body */}
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="shrink-0">
                                <BsFolder2Open
                                  className="size-6"
                                  style={{ color: projectColor }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                                  {project.name}
                                </h3>
                                {project.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center gap-3 pt-3 border-t border-borderColorPrimary text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{conversationCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{fileCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const conversationCount = project.histories?.length || 0;
                      const fileCount = project.files?.length || 0;
                      const projectColor = project.color || "";

                      return (
                        <div
                          key={project.uuid}
                          onClick={() => handleProjectClick(project)}
                          className="group bg-backgroundSecondary border border-borderColorPrimary rounded-lg overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-sm"
                        >
                          <div className="flex items-center">
                            {/* Colored left strip */}
                            <div
                              className="w-1 h-full self-stretch"
                              style={{ backgroundColor: projectColor }}
                            />

                            {/* Card Content */}
                            <div className="flex items-center gap-4 p-4 flex-1">
                              <div className="shrink-0">
                                <BsFolder2Open
                                  className="h-5 w-5"
                                  style={{ color: projectColor }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-foreground truncate">
                                  {project.name}
                                </h3>
                                {project.description && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {project.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>{conversationCount}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>{fileCount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Fade Effect at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </>
  );
}