"use client";
import { Workbench } from "@/components/features/developer/developer-workbench";
import { useEffect } from "react";
import { useApiKeyStore } from "@/stores";
import { keysApi } from "@/lib/api/keys";
import { useAuthStore } from "@/stores";
import useChatAPIStore from "@/stores/developer-benchmark";
export default function Page() {
  const { keys, addKey, clearKeys } = useApiKeyStore();
  const { user } = useAuthStore();
  const { userId: storedUserId, clearHistory } = useChatAPIStore();

  //  prevent different user from using same history data
  useEffect(() => {
    // console.log(user?.email)
    // console.log(`storedUserId: ${storedUserId}`);
    if (storedUserId && user?.email && storedUserId !== user.email) {
      clearHistory();
    }
  }, [storedUserId, user?.email, clearHistory]);

  useEffect(() => {
    const checkAndFetchApiKeys = async () => {
      if (keys.length === 0) {
        try {
          const response = await keysApi.getAllApiKeys();
          clearKeys();
          response.forEach((apiKey) => {
            addKey({
              id: apiKey.id.toString(),
              name: apiKey.name,
              key: apiKey.key,
              workspace: "default",
              isVisible: false,
              isDisabled: apiKey.active === 0,
              createdAt: apiKey.created_at,
              lastUsed: apiKey.last_used_at,
              createdBy: "You",
              email: "your@email.com",
              cost: "$0.00",
            });
          });
        } catch (error) {
          // console.error('Failed to load API keys');
          return;
        }
      }
    };

    checkAndFetchApiKeys();
  }, [keys.length, addKey, clearKeys]);

  return <Workbench />;
}
