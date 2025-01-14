import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // Backend URL

// Fetch all customers
export const getCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { customers: [] };
  }
};

// Create a new customer
export const createCustomer = async (customer) => {
  try {
    console.log("Customer:" ,customer)
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
    console.log("Inside API:",{"id":id,"name":customer.name,"money":customer.balance,"phone":customer.phone_number});
    const response = await axios.put(`${API_URL}/customers/${id}`, {
      name: customer.name,
      balance: customer.balance,
      phone_number: customer.phone_number,
    });
    console.log("Updating customer: ", response.data);
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


// Login function
export const login = async (loginData) => {
  try {
    console.log("Login Data: ", loginData);
    const response = await axios.post(`${API_URL}/login`, loginData);
    return response.data; // Returns a success message or any other data from the backend
  } catch (error) {
    console.error("Error logging in:", error);
    return { message: "Login failed", error: error.response?.data?.detail || error.message };
  }
};