import axios from "axios";

const API_URL = "https://kathulis-backend.vercel.app"; // Backend URL

// Frontend login function
export const login = async (data) => {
  try {
    console.log(data);
    const response = await axios.post(`${API_URL}/login`, {
      name: data.name,
      password: data.password,
      role: data.role,
    }, {
      headers: {
        "Content-Type": "application/json", // Ensure Content-Type is set to application/json
      }
    });
    return response.data; // { status, name, role }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.detail || error.message };
  }
};
// Fetch all customers
export const getCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers/`);
    console.log("api data: ",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { customers: [] };
  }
};


// Create a new customer
export const createCustomer = async (customer) => {
  try {
    const response = await axios.post(`${API_URL}/customers/`, {
      name: customer.name,
      balance: customer.balance,      
      phone_number: customer.phone_number,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
};

// Update an existing customer
export const updateCustomer = async (id, customer) => {
  try {
    console.log("Updating customer with ID:", id);
    const response = await axios.put(`${API_URL}/customers/${id}`, {
      name: customer.name,
      balance: customer.balance,
      phone_number: customer.phone_number,
    });
    console.log("Response data:", response.data);  // Debugging the response
    return response.data;
  } catch (error) {
    console.error("Error updating customer:", error);
  }
};

// Delete a customer
export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

