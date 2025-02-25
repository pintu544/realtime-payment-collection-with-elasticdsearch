//// filepath: /f:/CW JAVA/files/frontend/pages/payments.js
import React, { useState, useEffect } from "react";
import { api, socket } from "../utils/api";
import { useRouter } from "next/router";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [newPayment, setNewPayment] = useState({ customerId: "", amount: "" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchPayments(); // fetch immediately

    socket.on("paymentUpdate", (updatedPayment) => {
      // Refresh payments list on update
      fetchPayments();
    });

    return () => {
      socket.off("paymentUpdate");
    };
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments", error);
      // If unauthorized, redirect to login.
      if (error.response && error.response.status === 401) {
        router.push("/");
      }
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments", newPayment);
      alert("Payment created");
      setNewPayment({ customerId: "", amount: "" });
      fetchPayments();
    } catch (error) {
      console.error("Error creating payment", error);
      if (error.response && error.response.status === 401) {
        router.push("/");
      }
    }
  };

  const handleUpdatePayment = async (id, status) => {
    try {
      await api.put(`/payments/${id}`, { status });
      alert("Payment updated");
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment", error);
      if (error.response && error.response.status === 401) {
        router.push("/");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Payment Management</h3>
      <form onSubmit={handleCreatePayment}>
        <input
          type="text"
          placeholder="Customer ID"
          value={newPayment.customerId}
          onChange={(e) =>
            setNewPayment({ ...newPayment, customerId: e.target.value })
          }
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={newPayment.amount}
          onChange={(e) =>
            setNewPayment({ ...newPayment, amount: e.target.value })
          }
          required
        />
        <button type="submit">Create Payment</button>
      </form>
      <div style={{ marginTop: "20px" }}>
        <h4>Payments</h4>
        {payments.length === 0 ? (
          <p>No payments yet</p>
        ) : (
          <ul>
            {payments.map((payment) => (
              <li key={payment.id}>
                Payment ID {payment.id}: {payment.status}
                <button
                  onClick={() => handleUpdatePayment(payment.id, "completed")}
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdatePayment(payment.id, "pending")}
                >
                  Mark Pending
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Payments;
