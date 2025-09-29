import requests
import io

def test_create_property_with_images():
    base_url = "http://localhost:5001"
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Prepare multipart form data with images
    # We'll create two in-memory dummy images for upload
    image1 = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00")
    image1.name = "image1.png"
    image2 = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x01")
    image2.name = "image2.png"

    data = {
        "title": "Spacious Family Home",
        "description": "A beautiful 4-bedroom family home in the suburbs.",
        "price": "350000",
        "property_type": "House",
        "location": "1234 Elm Street, Springfield"
    }
    files = [
        ("images", (image1.name, image1, "image/png")),
        ("images", (image2.name, image2, "image/png")),
    ]

    property_id = None

    try:
        response = requests.post(
            f"{base_url}/api/properties",
            headers=headers,
            data=data,
            files=files,
            timeout=30
        )
        assert response.status_code == 201, f"Expected status 201, got {response.status_code}"
        response_json = response.json()
        # Expect returned json to include created property with an id or _id
        property_id = response_json.get("id") or response_json.get("_id")
        assert property_id is not None, "Response JSON does not contain property ID"
    finally:
        if property_id:
            # Clean up by deleting the created property
            try:
                del_resp = requests.delete(
                    f"{base_url}/api/properties/{property_id}",
                    headers=headers,
                    timeout=30
                )
                assert del_resp.status_code == 200, f"Failed to delete property with ID {property_id}"
            except Exception:
                pass


test_create_property_with_images()