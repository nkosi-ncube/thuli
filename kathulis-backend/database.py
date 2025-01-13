from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv


#Load environmental variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_RL","postgresql://postgres:password@localhost/Kathulis_db")

engine=create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base = declarative_base()
