const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---- Contracts ----

export async function uploadContract(
  file: File,
  title?: string
): Promise<{ id: string; title: string; status: string }> {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);

  const res = await fetch(`${API_BASE}/contracts/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}

export async function listContracts() {
  return request<import("@/types").Contract[]>("/contracts/");
}

export async function getContract(id: string) {
  return request<import("@/types").Contract>(`/contracts/${id}`);
}

export async function getContractStatus(id: string) {
  return request<{ id: string; status: string; title: string }>(
    `/contracts/${id}/status`
  );
}

export async function deleteContract(id: string) {
  const res = await fetch(`${API_BASE}/contracts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete contract");
  }
}

export async function compareContracts(id1: string, id2: string) {
  return request<import("@/types").ComparisonResult>("/contracts/compare", {
    method: "POST",
    body: JSON.stringify({ contract_id_1: id1, contract_id_2: id2 }),
  });
}

// ---- Chat ----

export async function sendChatMessage(contractId: string, message: string) {
  return request<import("@/types").ChatMessage>("/chat/", {
    method: "POST",
    body: JSON.stringify({ contract_id: contractId, message }),
  });
}

export async function getChatHistory(contractId: string) {
  return request<import("@/types").ChatMessage[]>(`/chat/${contractId}/history`);
}

export async function clearChatHistory(contractId: string) {
  return request<{ message: string }>(`/chat/${contractId}/history`, {
    method: "DELETE",
  });
}

// ---- Auth ----

export async function register(email: string, password: string, fullName?: string) {
  return request<{ access_token: string; user: object }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName || "" }),
  });
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; user: object }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
