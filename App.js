import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, login } from './src/api/api';
import { Ionicons } from 'react-native-vector-icons';
import { Button, Card, Title, Paragraph, TextInput as PaperInput } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';

const SplashScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Ionicons name="beer" size={100} color="#fff" />
      <Text style={styles.splashTitle}>Welcome to KaThuli's Tavern</Text>
      {isLoading && <Text style={styles.loading}>Pouring your experience...</Text>}
    </View>
  );
};

const CustomerPage = ({ route }) => {
  const { name } = route.params; // Access 'name' from route params
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch customer's details using the name
    const fetchCustomerDetails = async () => {
      try {
        const response = await getCustomers();
        console.log('Route params:', route.params); // Debug route params
        console.log('Customers response:', response.customers); // Debug customers

        // Find customer by name
        const customer = response.customers.find(cust => cust.name === name);
        console.log('Filtered customer:', customer); // Debug filtered customer

        if (customer) {
          setCustomerData(customer); // Store full customer data
        } else {
          Alert.alert('Error', 'Customer not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch customer details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [name]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customer Dashboard</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#1e3a8a" />
      ) : (
        customerData && (
          <>
            <Text style={{ fontSize: 18, color: '#555', marginBottom: 10 }}>
              Name: {customerData.name}
            </Text>
            <Text style={{ fontSize: 18, color: '#555', marginBottom: 10 }}>
              Phone: {customerData.phone_number}
            </Text>
            <Text style={{ fontSize: 18, color: '#4CAF50', marginBottom: 10 }}>
              Balance: {customerData.balance}
            </Text>
            <Text style={{ fontSize: 18, color: '#888', marginBottom: 20 }}>
              Password: {customerData.password}
            </Text>
          </>
        )
      )}
    </ScrollView>
  );
};

const LoginScreen = ({ navigation }) => {
  const [name, setname] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await login({ name, password, role });
      if (response.status === 200) {
        Toast.show({ type: 'success', text1: 'Login Successful' });
        if (response.role === 'admin') {
          navigation.replace('MainApp', { role: response.role, name });
        } else if (response.role === 'customer') {
          navigation.replace('CustomerPage', { role: response.role, name:response.name});
        }
      } else {
        // Alert.alert('Invalid credentials', 'Please check your name and password.');
        Toast.show({ type: 'error', text1: 'Invalid credentials' });
      }
    } catch (error) {
       Toast.show({ type: 'error', text1: 'Login failed', text2: error.message });
    
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>
      <PaperInput
        label="Name"
        value={name}
        onChangeText={setname}
        style={styles.input}
        left={<PaperInput.Icon name="account" />}
        placeholder="Enter your name"
      />
      <PaperInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        left={<PaperInput.Icon name="lock" />}
        placeholder="Enter your password"
      />
      <Text style={styles.selectLabel}>Role</Text>
      <RNPickerSelect
        onValueChange={(value) => setRole(value)}
        items={[
          { label: 'Admin', value: 'admin' },
          { label: 'Customer', value: 'customer' },
        ]}
        style={pickerSelectStyles}
        value={role}
      />
      <Button mode="contained" style={styles.button} onPress={handleLogin} loading={isLoading}>
        Login
      </Button>
    </ScrollView>
  );
};

const App = ({ route }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setButtonLoader] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // For fetching customers
  const [isAdding, setIsAdding] = useState(false); // For adding a customer
  const [isUpdating, setIsUpdating] = useState(false); 
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingBalance, setEditingBalance] = useState('');
  const [editingPhoneNumber, setEditingPhoneNumber] = useState('');
  const userRole = route.params.role;
  const [saving , setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsFetching(true);
    try {
      const data = await getCustomers();
      setCustomers(data.customers);
      Toast.show({ type: 'success', text1: 'Customers Loaded' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load customers' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleWhatsApp = (phoneNumber,balance) => {
    
    const message = encodeURIComponent(`Hello! Please clear your payment of R${balance}  at KaThuli's Tavern. Thank you!`);
    const url = Platform.OS === 'ios'
      ? `whatsapp://send?phone=${phoneNumber}&text=${message}`
      : `https://wa.me/+27${phoneNumber}?text=${message}`;

    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed.'));
  };
  const handleCreateCustomer = async () => {
    if (!newName || !newBalance || !newPhoneNumber) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    try {
      setIsAdding(true);
      await createCustomer({ name: newName, balance: parseFloat(newBalance), phone_number: newPhoneNumber });
      setNewName('');
      setNewBalance('');
      setNewPhoneNumber('');
      fetchCustomers();
      Toast.show({ type: 'success', text1: 'Customer Created' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to create customer' });
    }finally{
      setIsAdding(false);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      // setButtonLoader(true);
      await deleteCustomer(customerId);
      fetchCustomers();
      Toast.show({ type: 'success', text1: 'Customer Deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete customer' });
    }finally{
      // setButtonLoader(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomerId(customer._id);
    setEditingName(customer.name);
    setEditingBalance(customer.balance.toString());
    setEditingPhoneNumber(customer.phone_number);
  };
  const handleSaveEdit = async () => {
    if (!editingName || !editingBalance || !editingPhoneNumber) {
      Alert.alert('Error', 'All fields must be filled.');
      return;
    }
  
    console.log('Saving changes for customer:', {
      editingCustomerId,
      editingName,
      editingBalance,
      editingPhoneNumber,
    });
  
    setIsSaving(true);  // Start loading when saving
  
    try {
      setIsUpdating(true); 
      await updateCustomer(editingCustomerId, {
        name: editingName,
        balance: parseFloat(editingBalance),
        phone_number: editingPhoneNumber,
      });
      setEditingCustomerId(null);
      setEditingName('');
      setEditingBalance('');
      setEditingPhoneNumber('');
      fetchCustomers();
      Toast.show({ type: 'success', text1: 'Customer Updated Successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to update customer' });
    } finally {
      setIsSaving(false); 
      setIsUpdating(false); // Stop loading once done
    }
  };
  

  const renderCustomer = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.customerName}>{item.name}</Title>
        <Paragraph >ID:{item._id}</Paragraph>
        <Paragraph style={styles.balance}>Balance: {item.balance}</Paragraph>
        <Paragraph style={styles.phoneNumber}>Phone: {item.phone_number}</Paragraph>
        <Paragraph style={styles.password}>Password:{item.password}</Paragraph>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Ionicons name="pencil" size={24} color="#007BFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleWhatsApp(item.phone_number,item.balance)}>
            <Ionicons name="logo-whatsapp" size={24} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      {userRole === 'admin' && (
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>Create a New Customer</Text>
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
         <Button mode="contained" onPress={handleCreateCustomer} loading={isAdding}> 
  Add Customer
</Button>

           
        </View>
      )}
      {editingCustomerId && (
        <View style={styles.editForm}>
          <Text style={styles.sectionTitle}>Edit Customer</Text>
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
          <Button mode="contained" onPress={handleSaveEdit} loading={isUpdating}>
            Save Changes
          </Button>
        </View>
      )}
      <FlatList
        data={customers}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderCustomer}
        refreshing={loading}
        onRefresh={fetchCustomers}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const MainApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={App} />
      <Stack.Screen name="CustomerPage" component={CustomerPage} />
    </Stack.Navigator>
    <Toast />
  </NavigationContainer>
);

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#2c3e50',
    marginBottom: 15,
  },
  inputIOS: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#2c3e50',
    marginBottom: 15,
  },
});

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
  },
  splashTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 10,
    color: '#fff',
    fontStyle: 'italic',
  },
  container: {
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 50,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#1e3a8a',
    borderRadius: 5,
  },
  card: {
    marginVertical: 10,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 8,
    padding: 10,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  createSection: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  editForm: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    marginBottom: 20,
  },
});

export default MainApp;
