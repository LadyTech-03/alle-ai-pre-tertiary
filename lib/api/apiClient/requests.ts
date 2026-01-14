import { useApiKeyStore } from "@/stores/index";

interface ModelsResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

/**
 * Helper function to get the active API key from the store
 */
const getApiKey = (): string => {
  const apiKeyStore = useApiKeyStore.getState();
  const activeKeys = apiKeyStore.keys.filter((key) => !key.isDisabled);

  // Use the first active key, or return a fallback if none available
  return activeKeys.length > 0 ? activeKeys[0].key : "";
};

/**
 * Helper function to detect if a response is HTML instead of JSON
 */
const isHTMLResponse = (text: string): boolean => {
  return (
    text.trim().startsWith("<!DOCTYPE html>") ||
    text.trim().startsWith("<html") ||
    (text.includes("<body") && text.includes("</body>"))
  );
};

export const requestJson = async (url: string, body: object): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: "POST",
      headers: {
        "X-API-KEY": getApiKey(),
        Authorization: `Bearer ${process.env.TEST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      let errorMessage = `Request failed with status: ${status}`;
      let errorDetails = null;
      try {
        const errorBody = await response.text();
        // Check if response is HTML (likely PHP error page)
        if (isHTMLResponse(errorBody)) {
          // console.log(errorBody);
          return {
            error: {
              message: `We're having trouble connecting to the model provider. This might be temporary - please try again in a moment.
`,
              status,
            },
          };
        }
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
          errorDetails = errorJson;
        } catch (parseError) {
          errorDetails = { raw: errorBody };
        }
      } catch (textError) {
        // If we can't read the response text
      }

      // Return error information as a JSON object
      return {
        error: {
          message: errorMessage,
          status,
          details: errorDetails,
        },
      };
    }

    // Process successful response - return data directly
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      error: {
        message: "Network error occurred",
        status: null,
        details: {
          originalError: error instanceof Error ? error.message : String(error),
        },
      },
    };
  }
};

// formdata request

export const makeFormDataRequest = async (
  endpoint: string,

  formData: FormData
): Promise<any> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": getApiKey(),
          Authorization: `Bearer ${process.env.TEST_API_KEY}`,
          // Note: Content-Type is automatically set by fetch when using FormData
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const status = response.status;
      let errorMessage = `Request failed with status: ${status}`;
      let errorDetails = null;
      try {
        const errorBody = await response.text();
        // Check if response is HTML (likely PHP error page)
        if (isHTMLResponse(errorBody)) {
          return {
            error: {
              message: `We're having trouble connecting to the model provider. This might be temporary - please try again in a moment.
`,
              status,
            },
          };
        }
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
          errorDetails = errorJson;
        } catch (parseError) {
          errorDetails = { raw: errorBody };
        }
      } catch (textError) {
        // If we can't read the response text
      }

      // Return error information as a JSON object
      return {
        error: {
          message: errorMessage,
          status,
          details: errorDetails,
        },
      };
    }

    // Process successful response - return data directly
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors or other exceptions
    return {
      error: {
        message: "Network error occurred",
        status: null,
      },
    };
  }
};
