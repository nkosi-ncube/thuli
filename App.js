import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator, Linking, ScrollView,Platform } from 'react-native';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, login } from './src/api/api';
import { Ionicons } from 'react-native-vector-icons';
import { Button, Card, Title, Paragraph, TextInput as PaperInput } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RNPickerSelect from 'react-native-picker-select';

// SplashScreen Component
const SplashScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Login'); // Transition to Login after 2 seconds
    }, 2000);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Ionicons name="beer" size={100} color="#fff" />
      <Text style={styles.splashTitle}>Welcome to KaThuli's Tavern</Text>
      {isLoading && <Text style={styles.loading}>Pouring your experience.....</Text>}
     </View>
  );
};

// Login Screen Component
const LoginScreen = ({ navigation }) => {
  const [name, setname] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  console.log("Role: ",role);
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await login({ name, password, role }); // Assume this API function validates the credentials
    
      if (response.status === 200) {
        // If login is successful, pass the role from the response
        if (response.role === "admin") {
          navigation.replace('MainApp', { role: response.role, name });
        } else if (response.role === "customer") {
          navigation.replace('CustomerPage', { role: response.role, name });
        }
      } else {
        Alert.alert('Invalid credentials', 'Please check your name and password.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <PaperInput
  label="Name"
  value={name}
  onChangeText={setname}
  style={styles.input}
  left={<PaperInput.Icon name="account" color="#2c3e50" />}
  placeholder="Enter your name"
  theme={{ colors: { primary: '#2c3e50', underlineColor: 'transparent' } }}
/>

<PaperInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  style={styles.input}
  secureTextEntry
  left={<PaperInput.Icon name="lock" color="#2c3e50" />}
  placeholder="Enter your password"
  theme={{ colors: { primary: '#2c3e50', underlineColor: 'transparent' } }}
/>

<Text style={styles.selectLabel}>Role</Text>
      <RNPickerSelect
        onValueChange={(value) => setRole(value)}
        items={[
          { label: 'Admin', value: 'admin' },
          { label: 'Customer', value: 'customer' },
        ]}
        style={pickerSelectStyles} // Apply styles here
        value={role}
      />
      <Button mode="contained" style={styles.button} onPress={handleLogin} loading={isLoading}>
        Login
      </Button>
    </View>
  );
};

// Customer Page Component
const CustomerPage = ({ route }) => {
  const { name } = route.params; // Get the name from the navigation params
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer data by name
    const fetchCustomerData = async () => {
      try {
        const customerData = await getCustomers(); // Assume the API returns all customers
        const foundCustomer = customerData.customers.find(c => c.name === name);
        setCustomer(foundCustomer);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [name]);
  const handleLogout = () => {
    // Clear user session (e.g., remove tokens, reset global state)
    // This depends on your authentication method (AsyncStorage, Redux, etc.)
    // Example for clearing AsyncStorage:
    // AsyncStorage.removeItem('userToken');
    
    // Navigate to the login page
    navigation.navigate('Login'); // Replace 'Login' with the appropriate route name
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!customer) {
    return <Text>No customer found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {customer.name}!</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.customerName}>{customer.name}</Title>
          <Paragraph style={styles.balance}>Balance: {customer.balance}</Paragraph>
          <Paragraph style={styles.phoneNumber}>Phone: {customer.phone_number}</Paragraph>
          <Paragraph style={styles.password}>Password: {customer.password}</Paragraph>
        </Card.Content>
      </Card>
           
      {/* Logout button with styled text */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main App Component
const App = ({ route }) => { // userRole is either 'admin' or 'customer'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingBalance, setEditingBalance] = useState('');
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const userRole = route.params.role;


  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      console.log("CUSTOMERS", data);
      setCustomers(data.customers);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const handleLogout = () => {
    // Clear user session (e.g., remove tokens, reset global state)
    // This depends on your authentication method (AsyncStorage, Redux, etc.)
    // Example for clearing AsyncStorage:
    // AsyncStorage.removeItem('userToken');
    
    // Navigate to the login page
    navigation.navigate('Login'); // Replace 'Login' with the appropriate route name
  };
  const handleCreate = async () => {
    if (!newName || !newBalance || !newPhoneNumber) {
      Alert.alert('Error', 'Please provide all fields: name, balance, phone number, and password.');
      return;
    }
    try {
      await createCustomer({
        name: newName,
        balance: parseFloat(newBalance),
        phone_number: newPhoneNumber,
      });
      setNewName('');
      setNewBalance('');
      setNewPhoneNumber('');
      fetchCustomers(); // Refresh the customer list
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!editingName || !editingBalance || !editingPhoneNumber) {
      Alert.alert('Error', 'Please provide all fields: name, balance, phone number, and password.');
      return;
    }
    try {
      console.log({"name":editingName,"newBalance":editingBalance,"phone":editingPhoneNumber});
      await updateCustomer(editingCustomerId, {
        name: editingName,
        balance: parseFloat(editingBalance),
        phone_number: editingPhoneNumber,
      });
      setEditingCustomerId(null);
      setEditingName('');
      setEditingBalance('');
      setEditingPhoneNumber('');
      fetchCustomers(); // Refresh the customer list
    } catch (error) {
      console.error(error);
    }
  };

  // Hardcoded reminder message
  const reminderMessage = "Hello, this is a friendly reminder to clear your payment at KaThuli's Tavern. Thank you!";

  const handleSMS = (phoneNumber) => {
    const url = `sms:${phoneNumber}?body=${encodeURIComponent(reminderMessage)}`;
    Linking.openURL(url).catch((err) => console.error('Error opening SMS:', err));
  };

  const handleWhatsApp = (phoneNumber) => {
    const message = encodeURIComponent(reminderMessage);
  
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // For mobile devices (Android/iOS), use the whatsapp:// URL scheme
      const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
      Linking.openURL(url).catch((err) => console.error('Error opening WhatsApp:', err));
    } else {
      // For desktop (PC), use the https://wa.me/ URL to open WhatsApp Web
      const url = `https://wa.me/${phoneNumber}?text=${message}`;
      Linking.openURL(url).catch((err) => console.error('Error opening WhatsApp:', err));
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      fetchCustomers(); // Refresh the customer list
    } catch (error) {
      console.error(error);
    }
  };
  // const handleLogout = (navigation) => {
  //   Alert.alert(
  //     "Logout",
  //     "Are you sure you want to logout?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Logout",
  //         style: "destructive",
  //         onPress: () => navigation.replace("Login"),
  //       },
  //     ]
  //   );
  // };
  
  const renderCustomer = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.customerName}>{item.name}</Title>
        <Paragraph style={styles.balance}>Balance: {item.balance}</Paragraph>
        <Paragraph style={styles.phoneNumber}>Phone: {item.phone_number}</Paragraph>
        <Paragraph style={styles.password}>Password: {item.password}</Paragraph>
        <View style={styles.cardActions}>
        <TouchableOpacity
            onPress={() => {
              setEditingCustomerId(item.id);
              setEditingName(item.name);
              setEditingBalance(item.balance.toString());
              setEditingPhoneNumber(item.phone_number);
              setEditingPassword(item.password);
            }}
          >
            <Ionicons name="pencil" size={24} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSMS(item.phone_number)}>
            <Ionicons name="mail" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleWhatsApp(item.phone_number)}>
            <Ionicons name="logo-whatsapp" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>

  );

  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.scrollContainer}>
      <Text style={styles.title}>KaThuli's Tavern - Admin Panel</Text>
      {console.log("Current Role: ",userRole)}
      {userRole === 'admin' && (
        <View>
          <Text style={styles.title}>Create a New Customer</Text>
          <PaperInput
            label="Name"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />
          <PaperInput
            label="Balance"
            value={newBalance}
            onChangeText={setNewBalance}
            style={styles.input}
            keyboardType="numeric"
          />
          <PaperInput
            label="Phone Number"
            value={newPhoneNumber}
            onChangeText={setNewPhoneNumber}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreate}>
            Add Customer
          </Button>
        </View>
      )}

{editingCustomerId && (
        <View style={styles.editForm}>
          <Text style={styles.title}>Edit Customer</Text>
          <PaperInput
            label="Name"
            value={editingName}
            onChangeText={setEditingName}
            style={styles.input}
          />
          <PaperInput
            label="Balance"
            value={editingBalance}
            onChangeText={setEditingBalance}
            style={styles.input}
            keyboardType="numeric"
          />
          <PaperInput
            label="Phone Number"
            value={editingPhoneNumber}
            onChangeText={setEditingPhoneNumber}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleUpdate}>
            Save Changes
          </Button>
        </View>
      )}
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCustomer}
        refreshing={loading}
        onRefresh={fetchCustomers}
      />
         {/* Logout button with styled text */}
         <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const MainApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainApp" component={App} />
        <Stack.Screen name="CustomerPage" component={CustomerPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#2c3e50',
    marginBottom: 15,
  },
  inputIOS: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#2c3e50',
    marginBottom: 15,
  },
  placeholder: {
    color: '#bbb',
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  loading: {
    marginTop: 10,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 50, // Ensures a consistent and comfortable input height
  },

  button: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#1e3a8a',
    borderRadius: 5,
  },
  card: {
    marginVertical: 10,
    backgroundColor: '#ffffff',
    elevation: 3,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  balance: {
    fontSize: 16,
    color: '#4b5563',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  password: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  createSection: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  actionIcon: {
    marginHorizontal: 10,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#f44336', // Red color for the logout button
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff', // White text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,  // Ensure the scroll view takes full height
  },
});

export default MainApp;
