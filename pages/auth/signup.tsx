// pages/auth/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./signin.module.css"; // signin と共通で使うCSS

export default function SignUp() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
  
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
  
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
  
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (res.ok) {
      router.push("/auth/signin");
    } else {
      const data = await res.json();
      setError(data.message || "Sign up failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Name:
          <input type="text" name="name" required className={styles.input} />
        </label>
        <label className={styles.label}>
          Email:
          <input type="email" name="email" required className={styles.input} />
        </label>
        <label className={styles.label}>
          Password:
          <input type="password" name="password" required className={styles.input} />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className={styles.button}>Create Account</button>
      </form>
    </div>
  );
}
