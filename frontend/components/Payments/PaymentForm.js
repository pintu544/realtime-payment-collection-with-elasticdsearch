import { useState } from "react";
import { api } from "../../utils/api";
function PaymentForm({ customers, onPaymentCreated }) {
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !amount) {
      alert("Please select a customer and enter an amount.");
      return;
    }
    const payload = { customerId, amount: parseFloat(amount), status };
    try {
      const response = await api.post("/payments", payload);
      if (response.data) {
        onPaymentCreated(response.data);
        setCustomerId("");
        setAmount("");
        setStatus("pending");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Payment</h2>
      <div>
        <label>Customer: </label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Amount: </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Status: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button type="submit">Create Payment</button>
    </form>
  );
}

export default PaymentForm;
