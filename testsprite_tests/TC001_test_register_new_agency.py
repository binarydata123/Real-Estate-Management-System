import requests

def test_register_new_agency():
    base_url = "http://localhost:5001"
    url = f"{base_url}/api/auth/register-agency"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "fullName": "Test Agency Admin",
        "email": "testagency@example.com",
        "password": "StrongPassword123!",
        "agencyName": "Test Agency",
        "agencySlug": "test-agency",
        "phone": "123-456-7890"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

test_register_new_agency()
