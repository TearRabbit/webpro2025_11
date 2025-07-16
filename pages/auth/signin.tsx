// pages/auth/signin.tsx
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./signin.module.css";

export default function SignIn() {
  const router = useRouter();
  const { error } = router.query;
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!error) {
      setErrorMessage("");
      return;
    }

    switch (error) {
      case "CredentialsSignin":
        setErrorMessage("Invalid email or password.");
        break;
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
      case "OAuthAccountNotLinked":
        setErrorMessage("Authentication failed.");
        break;
      default:
        setErrorMessage("An unknown error occurred.");
    }
  }, [error]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign In to PaperShelf</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const email = (e.currentTarget.email as HTMLInputElement).value;
          const password = (e.currentTarget.password as HTMLInputElement).value;
          signIn("credentials", { email, password, callbackUrl: "/dashboard" });
        }}
        className={styles.form}
      >
        <label className={styles.label}>
          Email:
          <input name="email" type="email" required className={styles.input} />
        </label>
        <label className={styles.label}>
          Password:
          <input name="password" type="password" required className={styles.input} />
        </label>
        {errorMessage && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{errorMessage}</p>
        )}
        <button type="submit" className={styles.button}>Sign In</button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link href="/auth/signup" className={styles.link}>
            Sign Up
        </Link>
      </p>
    </div>
  );
}
