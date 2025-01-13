from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Customer
from pydantic import BaseModel
import random
import string
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Create the tables in the database (if not created already)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Define the allowed origins (frontend apps)
origins = [
    "http://localhost:8081",  # React Native / Expo
    "http://localhost:3000",  # React web app
    "http://127.0.0.1:8000", 
    'https://b040-41-113-232-96.ngrok-free.app',
    "https://b040-41-113-232-96.ngrok-free.app'"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model to receive customer data for creating and updating customers
class CustomerCreate(BaseModel):
    name: str
    phone_number: str
    balance: float  # Optional balance field
    
  
class LoginRequest(BaseModel):
    name: str
    password: str
    role: str  # Either 'admin' or 'customer'


# Utility function to generate a random password
def generate_random_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))


# API route to login
@app.post("/login")
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    # Check for admin login
    if login_request.role == "admin":
        if login_request.name == "Thuli" and login_request.password == "owner":
            return {"status":status.HTTP_200_OK,"name":login_request.name,"role":login_request.role}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    # Check for customer login
    elif login_request.role == "customer":
        customer = db.query(Customer).filter(Customer.name == login_request.name).first()
        if customer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
        
        if customer.password == login_request.password:
            return {"status":status.HTTP_200_OK,"name":login_request.name,"role":login_request.role}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role. Must be 'admin' or 'customer'")

# API route to get all customers
@app.get("/customers/")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return {"customers": customers}

# API route to get a specific customer by ID
@app.get("/customers/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

# API route to create a new customer
@app.post("/customers/")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    logging.info("Incoming customer data: %s", customer.dict()) 
    print("Incoming customer data:", customer.dict())
    # Check if the phone number already exists
    existing_customer = db.query(Customer).filter(Customer.phone_number == customer.phone_number).first()
    if existing_customer:
        raise HTTPException(status_code=400, detail="Phone number already exists")

    # Generate a random password
    password = generate_random_password()
    print("Password",password,sep="|")
    # Create the new customer
    db_customer = Customer(
        name=customer.name,
        phone_number=customer.phone_number,
        balance = customer.balance,
        password=password
    )
    print(db_customer)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    # Return the customer details along with the generated password
    return {
        "id": db_customer.id,
        "name": db_customer.name,
        "phone_number": db_customer.phone_number,
        "password": password  # Include the password in the response
    }

# API route to update an existing customer's details
@app.put("/customers/{customer_id}")
def update_customer(customer_id: int, customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db_customer.name = customer.name
    db_customer.balance = customer.balance
    db_customer.phone_number = customer.phone_number
    db.commit()
    db.refresh(db_customer)
    return db_customer

# API route to delete a customer
@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"detail": "Customer deleted successfully"}
