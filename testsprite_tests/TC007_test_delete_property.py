import requests

BASE_URL = "http://localhost:5001"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
TIMEOUT = 30

def test_delete_property():
    property_id = None
    create_url = f"{BASE_URL}/api/properties"
    delete_url_template = f"{BASE_URL}/api/properties/{{}}"
    try:
        # Create a new property to delete
        multipart_data = {
            'title': (None, "Test Property for Deletion"),
            'description': (None, "This property is for testing deletion API."),
            'price': (None, "100000"),
            'property_type': (None, "Residential"),
            'location': (None, "Test City"),
            'category': (None, "villa"),
            'type': (None, "residential"),
        }
        # No images file uploaded for simplicity

        response_create = requests.post(create_url, headers=HEADERS, files=multipart_data, timeout=TIMEOUT)
        assert response_create.status_code == 201, f"Failed to create property: {response_create.text}"
        created_data = response_create.json()
        assert "id" in created_data or "_id" in created_data, "Created property ID not found in response."
        property_id = created_data.get("id") or created_data.get("_id")
        assert property_id, "Property ID is empty."

        # Now delete the created property
        delete_url = delete_url_template.format(property_id)
        response_delete = requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)
        assert response_delete.status_code == 200, f"Delete failed with status {response_delete.status_code}: {response_delete.text}"

        # Optionally, verify the property no longer exists
        response_get = requests.get(delete_url, headers=HEADERS, timeout=TIMEOUT)
        assert response_get.status_code == 404 or response_get.status_code == 400, f"Property still exists after deletion, get returned {response_get.status_code}"

    finally:
        # Cleanup in case delete failed
        if property_id:
            # Try to delete again to clean up
            try:
                requests.delete(delete_url_template.format(property_id), headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

test_delete_property()