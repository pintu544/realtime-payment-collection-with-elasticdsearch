import { useState } from "react";
import { api } from "../../utils/api";
function CustomerForm({ onCustomerCreated }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, contact };
    try {
      const response = await api.post("/customers", payload);
      if (response.data) {
        onCustomerCreated(response.data);
        setName("");
        setContact("");
      }
    } catch (err) {
      console.error("Error creating customer:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Customer</h2>
      <div>
        <label>Name: </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Contact: </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create Customer</button>
    </form>
  );
}

export default CustomerForm;
