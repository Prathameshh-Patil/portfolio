import type { ContactInput } from "@portfolio/contracts";
import { jsonBody, request } from "@/lib/api-client";

export const sendContact = (data: ContactInput) => request<{ ok: true }>("/api/contact", jsonBody("POST", data));
