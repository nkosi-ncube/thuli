from fastapi import APIRouter

router = APIRouter(prefix="/customers",tags=["customers"])

@router.get("/")
def get_customers():
    return {"customers":[]}