import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import CustomerForm from "../components/Customers/CustomerForm";
import CustomerList from "../components/Customers/CustomerList";
import BulkUpload from "../components/Customers/BulkUpload";
import PaymentForm from "../components/Payments/PaymentForm";
import Notifications from "../components/Notifications/Notifications";
import { api, socket } from "../utils/api";
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      socket.connect();
      fetchCustomers();
    }
    return () => {
      // Disconnect socket when component unmounts
      socket.disconnect();
    };
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      console.log("Customers response:", response.data); // Debug log
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <h1>Mini Collection Management System</h1>
      <CustomerForm onCustomerCreated={fetchCustomers} />
      <BulkUpload onUploadSuccess={fetchCustomers} />
      <CustomerList customers={customers} refreshCustomers={fetchCustomers} />
      <PaymentForm customers={customers} onPaymentCreated={fetchCustomers} />
      <Notifications />
    </div>
  );
}
