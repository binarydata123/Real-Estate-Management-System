import requests

def test_user_login():
    base_url = "http://localhost:5001"
    url = f"{base_url}/api/auth/login"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": "user@example.com",
        "password": "ValidPassword123!"
    }
    timeout = 30

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "token" in data, "JWT token not found in response"
    token = data["token"]
    assert isinstance(token, str) and len(token) > 0, "JWT token is empty or invalid"

test_user_login()