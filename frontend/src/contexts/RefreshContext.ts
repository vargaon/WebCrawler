import { createContext } from "preact";

export const RefreshTokenContext = createContext(0);
export const RequestRefreshContext = createContext(() => {});