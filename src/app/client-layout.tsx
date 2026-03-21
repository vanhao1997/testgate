"use client";

import { DataProvider } from "./data-provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return <DataProvider>{children}</DataProvider>;
}
