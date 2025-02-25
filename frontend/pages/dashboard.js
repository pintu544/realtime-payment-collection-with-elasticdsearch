// Dashboard Page shows customers list and notifications
import React, { useState, useEffect } from "react";
import { api, socket } from "../utils/api";
import CustomerList from "../components/Customers/CustomerList";
import NotificationCenter from "../components/Notifications/Notifications";
import { useRouter } from "next/router";

function Dashboard() {
  const [view, setView] = useState("customers");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [router]);

  return (
    <div style={{ padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("customers")}>Customers</button>
        <button onClick={() => setView("notifications")}>Notifications</button>
        <button onClick={() => router.push("/payments")}>Payments</button>
      </nav>
      {view === "customers" && <CustomerList />}
      {view === "notifications" && <NotificationCenter />}
    </div>
  );
}

export default Dashboard;
