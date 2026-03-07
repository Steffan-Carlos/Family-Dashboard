import type { CalendarProvider } from "../../types/calendar.js";
import { googleProvider } from "./google-provider.js";
import { microsoftProvider } from "./microsoft-provider.js";

const providers: Record<string, CalendarProvider> = {
  google: googleProvider,
  microsoft: microsoftProvider,
};

export function getProvider(providerName: string): CalendarProvider {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown calendar provider: ${providerName}`);
  }
  return provider;
}
