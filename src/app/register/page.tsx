"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "../data-provider";
import styles from "../auth.module.css";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useData();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }
        const success = register(email, password, name);
        if (success) {
            router.push("/dashboard");
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
                    <h1>Tạo tài khoản</h1>
                    <p>Bắt đầu sàng lọc ứng viên trong 5 phút</p>
                </div>

                {error && <div className={styles["auth-error"]}>{error}</div>}

                <form className={styles["auth-form"]} onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email công ty</label>
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
                            placeholder="Ít nhất 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                        Tạo tài khoản miễn phí
                    </button>
                </form>

                <div className={styles["auth-footer"]}>
                    Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}
