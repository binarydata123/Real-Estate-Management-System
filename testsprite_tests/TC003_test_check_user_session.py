import requests

def test_check_user_session():
    base_url = "http://localhost:5001"
    endpoint = "/api/auth/check-session"
    valid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"
    headers_valid = {
        "Authorization": f"Bearer {valid_token}"
    }
    # Test with valid token
    try:
        response_valid = requests.get(f"{base_url}{endpoint}", headers=headers_valid, timeout=30)
        assert response_valid.status_code == 200, f"Expected status 200 but got {response_valid.status_code}"
    except requests.RequestException as e:
        assert False, f"Request with valid token failed: {e}"

    # Test with invalid token
    headers_invalid = {
        "Authorization": "Bearer invalid.token.value"
    }
    try:
        response_invalid = requests.get(f"{base_url}{endpoint}", headers=headers_invalid, timeout=30)
        assert response_invalid.status_code == 401, f"Expected status 401 but got {response_invalid.status_code}"
    except requests.RequestException as e:
        assert False, f"Request with invalid token failed: {e}"

    # Test with missing token (no Authorization header)
    try:
        response_missing = requests.get(f"{base_url}{endpoint}", timeout=30)
        assert response_missing.status_code == 401, f"Expected status 401 but got {response_missing.status_code}"
    except requests.RequestException as e:
        assert False, f"Request with missing token failed: {e}"

test_check_user_session()