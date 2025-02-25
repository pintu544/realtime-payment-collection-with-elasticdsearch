import React, { useState, useEffect } from "react";
import { api, socket } from "../../utils/api";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [outstandingAmount, setOutstandingAmount] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      console.log("Customers:", response.data); // Debug log
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for customer updates
    socket.on("customerChange", () => {
      fetchCustomers();
    });

    fetchCustomers();

    // Cleanup
    return () => {
      socket.off("customerChange");
    };
  }, []);

  const handleUpdate = async (customerId) => {
    try {
      const response = await api.put(`/customers/${customerId}`, {
        name,
        contact,
        outstandingAmount,
        paymentDueDate,
      });
      if (response.data) {
        setEditingCustomer(null);
        socket.emit("customerUpdate", { type: "update", id: customerId });
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Failed to update customer");
    }
  };

  const handleDelete = async (customerId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this customer?"
      );
      if (!confirmed) return;

      const response = await api.delete(`/customers/${customerId}`);
      if (response.data) {
        socket.emit("customerUpdate", {
          type: "delete",
          id: customerId,
          message: `Customer was deleted`,
        });
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Failed to delete customer");
    }
  };

  const startEditing = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setContact(customer.contact);
    setOutstandingAmount(customer.outstandingAmount);
    setPaymentDueDate(customer.paymentDueDate);
  };

  return (
    <div className="customer-list">
      <h2>Customer List</h2>
      {error && <div className="error-message">{error}</div>}
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Outstanding Amount</th>
            <th>Payment Due Date</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers && customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  {editingCustomer?.id === customer.id ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td>
                  {editingCustomer?.id === customer.id ? (
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  ) : (
                    customer.contact
                  )}
                </td>
                <td>
                  {editingCustomer?.id === customer.id ? (
                    <input
                      type="number"
                      value={outstandingAmount}
                      onChange={(e) => setOutstandingAmount(e.target.value)}
                    />
                  ) : (
                    customer.outstandingAmount
                  )}
                </td>
                <td>
                  {editingCustomer?.id === customer.id ? (
                    <input
                      type="date"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                    />
                  ) : (
                    new Date(customer.paymentDueDate).toLocaleDateString()
                  )}
                </td>
                <td>
                  <span className={`status ${customer.paymentStatus}`}>
                    {customer.paymentStatus}
                  </span>
                </td>
                <td>
                  {editingCustomer?.id === customer.id ? (
                    <>
                      <button onClick={() => handleUpdate(customer.id)}>
                        Save
                      </button>
                      <button onClick={() => setEditingCustomer(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(customer)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(customer.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No customers available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;
