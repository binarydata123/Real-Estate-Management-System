import requests

def test_get_all_properties():
    base_url = "http://localhost:5001"
    endpoint = "/api/properties"
    url = base_url + endpoint
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        try:
            data = response.json()
            assert isinstance(data, dict), "Response JSON is not an object"
        except ValueError:
            assert False, "Response is not valid JSON"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_all_properties()