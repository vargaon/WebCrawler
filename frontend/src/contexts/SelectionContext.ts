import { createContext } from "preact";

export const SelectionContext = createContext<Set<string>>(new Set());