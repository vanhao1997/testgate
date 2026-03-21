"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useData } from "../data-provider";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useData();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    if (!user) return null;

    const navItems = [
        { href: "/dashboard", icon: "📊", label: "Tổng quan" },
        { href: "/dashboard/campaigns", icon: "🎯", label: "Chiến dịch" },
    ];

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <div className={styles["dashboard-layout"]}>
            {/* Sidebar */}
            <aside className={styles["sidebar"]}>
                <div className={styles["sidebar-header"]}>
                    <Link href="/" className={styles["sidebar-logo"]}>
                        <span className={styles["sidebar-logo-icon"]}>⚡</span>
                        <span className={styles["sidebar-logo-text"]}>TestGate</span>
                    </Link>
                </div>

                <nav className={styles["sidebar-nav"]}>
                    <div className={styles["sidebar-section"]}>
                        <div className={styles["sidebar-section-label"]}>Menu chính</div>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles["sidebar-link"]} ${isActive(item.href) ? styles["sidebar-link-active"] : ""}`}
                            >
                                <span className={styles["sidebar-link-icon"]}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className={styles["sidebar-footer"]}>
                    <div className={styles["sidebar-user"]}>
                        <div className={styles["sidebar-avatar"]}>
                            {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles["sidebar-user-info"]}>
                            <div className={styles["sidebar-user-name"]}>{user.full_name}</div>
                            <div className={styles["sidebar-user-email"]}>{user.email}</div>
                        </div>
                        <button className={styles["sidebar-logout-btn"]} onClick={handleLogout} title="Đăng xuất">
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className={styles["dashboard-main"]}>
                {children}
            </main>
        </div>
    );
}
