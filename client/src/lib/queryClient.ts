import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method: string, endpoint: string, body?: any) {
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  
  // Get current user for authentication header
  const currentUser = localStorage.getItem('currentUser');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (currentUser) {
    const user = JSON.parse(currentUser);
    if (user.id) {
      headers['X-User-ID'] = user.id.toString();
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Si impossible de parser l'erreur JSON, garder le message par défaut
    }
    throw new Error(errorMessage);
  }

  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get current user for authentication header
    const currentUser = localStorage.getItem('currentUser');
    const headers: Record<string, string> = {};
    
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id) {
        headers['X-User-ID'] = user.id.toString();
      }
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});