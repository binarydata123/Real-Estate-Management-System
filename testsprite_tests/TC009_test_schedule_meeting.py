import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5001"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def test_schedule_meeting():
    customer_id = None
    property_id = None
    meeting_id = None
    try:
        # Create a customer to use for the meeting
        customer_payload = {
            "name": "Test Customer",
            "email": "testcustomer@example.com",
            "phone": "1234567890",
            "address": "123 Test St, Test City"
        }
        res_customer = requests.post(
            f"{BASE_URL}/api/agent/customers/create",
            json=customer_payload,
            headers=headers,
            timeout=30
        )
        assert res_customer.status_code == 201, f"Failed to create customer: {res_customer.text}"

        # Get all customers to find the created customer's ID
        res_customers = requests.get(
            f"{BASE_URL}/api/agent/customers/get-all",
            headers=headers,
            timeout=30
        )
        assert res_customers.status_code == 200, f"Failed to get customers: {res_customers.text}"
        customers_list = res_customers.json()
        found_customer = next((c for c in customers_list if c.get('email') == customer_payload['email']), None)
        assert found_customer is not None, "Created customer not found in customers list"
        customer_id = found_customer.get("id") or found_customer.get("_id")
        assert customer_id is not None, "Customer ID not found"

        # Create a property to use for the meeting
        property_payload = {
            "title": "Test Property",
            "description": "A property for testing meetings",
            "price": 100000.0,
            "property_type": "Condo",
            "location": "Test Location"
        }

        multipart_data = {
            "title": property_payload["title"],
            "description": property_payload["description"],
            "price": str(property_payload["price"]),
            "property_type": property_payload["property_type"],
            "location": property_payload["location"],
        }
        res_property = requests.post(
            f"{BASE_URL}/api/properties",
            headers={"Authorization": f"Bearer {TOKEN}"},
            data=multipart_data,
            timeout=30
        )

        assert res_property.status_code == 201, f"Failed to create property: {res_property.text}"
        property_data = res_property.json()
        property_id = property_data.get("id") or property_data.get("_id")
        assert property_id is not None, "Property ID not returned in response"

        # Schedule a meeting with the created customer and property
        meeting_date = (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z"  # future date in ISO8601
        meeting_payload = {
            "customerId": customer_id,
            "propertyId": property_id,
            "meetingDate": meeting_date,
            "notes": "Discuss details and pricing"
        }
        res_meeting = requests.post(
            f"{BASE_URL}/api/agent/meetings/create",
            json=meeting_payload,
            headers=headers,
            timeout=30
        )
        assert res_meeting.status_code == 201, f"Failed to schedule meeting: {res_meeting.text}"
        meeting_id = res_meeting.json().get("id") or res_meeting.json().get("_id")
        assert meeting_id is not None, "Meeting ID not returned in response"

    finally:
        # Cleanup: delete created meeting, customer, and property if they exist
        if meeting_id:
            try:
                res_del_meeting = requests.delete(
                    f"{BASE_URL}/api/agent/meetings/delete/{meeting_id}",
                    headers=headers,
                    timeout=30
                )
                assert res_del_meeting.status_code == 200
            except Exception:
                pass
        if customer_id:
            try:
                res_del_customer = requests.delete(
                    f"{BASE_URL}/api/agent/customers/delete/{customer_id}",
                    headers=headers,
                    timeout=30
                )
                assert res_del_customer.status_code == 200
            except Exception:
                pass
        if property_id:
            try:
                res_del_property = requests.delete(
                    f"{BASE_URL}/api/properties/{property_id}",
                    headers=headers,
                    timeout=30
                )
                assert res_del_property.status_code == 200
            except Exception:
                pass


test_schedule_meeting()
