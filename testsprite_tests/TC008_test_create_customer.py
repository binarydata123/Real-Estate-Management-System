import requests

def test_create_customer():
    base_url = "http://localhost:5001"
    endpoint = "/api/agent/customers/create"
    url = base_url + endpoint

    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w",
        "Content-Type": "application/json"
    }
    payload = {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, Anytown, USA"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        assert response.status_code == 201, f"Expected status 201, got {response.status_code}"
        # Optionally validate response data structure or content here if needed
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_create_customer()
