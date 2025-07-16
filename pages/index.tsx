// pages/index.tsx
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null; // リダイレクト中に一瞬だけ表示する何か
  }

  return (
    <div style={{ maxWidth: 600, margin: "3rem auto", padding: "1rem" }}>
      <h1>Welcome, {session.user?.name || session.user?.email}!</h1>
      <p>You are signed in.</p>
      <button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#005fcc",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
