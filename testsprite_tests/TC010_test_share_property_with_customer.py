import requests
import uuid

BASE_URL = "http://localhost:5001"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def test_share_property_with_customer():
    property_id = None
    customer_id = None
    share_id = None

    # Create property
    try:
        prop_data = {
            "title": "Test Property " + str(uuid.uuid4()),
            "description": "Test property description",
            "price": 123456.78,
            "property_type": "Apartment",
            "location": "Test Location"
        }
        files = {}
        # As per PRD, create property expects multipart/form-data with specific fields
        multipart_data = {
            "title": (None, prop_data["title"]),
            "description": (None, prop_data["description"]),
            "price": (None, str(prop_data["price"])),
            "property_type": (None, prop_data["property_type"]),
            "location": (None, prop_data["location"])
        }
        resp_prop = requests.post(f"{BASE_URL}/api/properties", headers=HEADERS, files=multipart_data, timeout=30)
        assert resp_prop.status_code == 201, f"Property creation failed: {resp_prop.text}"
        property_id = resp_prop.json().get("id") or resp_prop.json().get("_id")
        assert property_id, "No property ID returned on creation"

        # Create customer
        cust_data = {
            "name": "Test Customer " + str(uuid.uuid4()),
            "email": f"testcustomer{uuid.uuid4().hex[:6]}@example.com",
            "phone": "123-456-7890",
            "address": "123 Test St"
        }
        resp_cust = requests.post(f"{BASE_URL}/api/agent/customers/create", headers={**HEADERS, "Content-Type": "application/json"}, json=cust_data, timeout=30)
        assert resp_cust.status_code == 201, f"Customer creation failed: {resp_cust.text}"
        customer_id = resp_cust.json().get("id") or resp_cust.json().get("_id")
        assert customer_id, "No customer ID returned on creation"

        # Share property with customer
        share_payload = {
            "propertyId": property_id,
            "customerId": customer_id,
            "message": "Sharing this property for your review."
        }
        resp_share = requests.post(f"{BASE_URL}/api/agent/shareProperties", headers={**HEADERS,"Content-Type": "application/json"}, json=share_payload, timeout=30)
        assert resp_share.status_code == 201, f"Property sharing failed: {resp_share.text}"

    finally:
        # Cleanup property
        if property_id:
            requests.delete(f"{BASE_URL}/api/properties/{property_id}", headers=HEADERS, timeout=30)
        # Cleanup customer
        if customer_id:
            requests.delete(f"{BASE_URL}/api/agent/customers/delete/{customer_id}", headers=HEADERS, timeout=30)

test_share_property_with_customer()
