"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "../data-provider";
import styles from "../auth.module.css";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useData();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }
        const success = login(email, password);
        if (success) {
            router.push("/dashboard");
        } else {
            setError("Email hoặc mật khẩu không đúng");
        }
    };

    return (
        <div className={styles["auth-page"]}>
            <div className={`card ${styles["auth-card"]}`}>
                <div className={styles["auth-header"]}>
                    <Link href="/" className={styles["auth-logo"]}>
                        <span>⚡</span>
                        <span>TestGate</span>
                    </Link>
                    <h1>Chào mừng trở lại</h1>
                    <p>Đăng nhập để quản lý bài test của bạn</p>
                </div>

                {error && <div className={styles["auth-error"]}>{error}</div>}

                <form className={styles["auth-form"]} onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                        Đăng nhập
                    </button>
                </form>

                <div className={styles["auth-footer"]}>
                    Chưa có tài khoản? <Link href="/register">Đăng ký miễn phí</Link>
                </div>
            </div>
        </div>
    );
}
