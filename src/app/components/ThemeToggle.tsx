"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("testgate-theme");
        if (saved === "dark") {
            setDark(true);
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        if (next) {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("testgate-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("testgate-theme", "light");
        }
    };

    return (
        <button className="theme-toggle" onClick={toggle} aria-label="Chuyển theme" title={dark ? "Chuyển sang sáng" : "Chuyển sang tối"}>
            {dark ? <Sun size={20} weight="fill" /> : <Moon size={20} weight="fill" />}
        </button>
    );
}
