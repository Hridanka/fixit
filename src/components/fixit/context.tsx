import { createContext, useContext, useState, type ReactNode } from "react";
import type { AnalyzeResponse } from "@/lib/analysis";

interface Ctx {
  code: string;
  setCode: (s: string) => void;
  result: AnalyzeResponse | null;
  setResult: (r: AnalyzeResponse | null) => void;
}
const FixitCtx = createContext<Ctx | null>(null);

export function FixitProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  return <FixitCtx.Provider value={{ code, setCode, result, setResult }}>{children}</FixitCtx.Provider>;
}

export function useFixit() {
  const c = useContext(FixitCtx);
  if (!c) throw new Error("useFixit outside provider");
  return c;
}
