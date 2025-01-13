from sqlalchemy import Column,Integer,String,Float
from database import Base



class Customer(Base):
    __tablename__ = "customers"
    id=Column(Integer,primary_key=True,index=True)
    name =Column(String,index=True)
    balance=Column(Float,default=0.0)
    phone_number = Column(String)
    password = Column(String)   
 