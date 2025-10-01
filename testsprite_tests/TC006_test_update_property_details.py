import requests
from requests.exceptions import RequestException
import io

BASE_URL = "http://localhost:5001"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGM1NWQ3YjJkZjc0MDYyYzgzNDFiZjUiLCJyb2xlIjoiQWdlbmN5QWRtaW4iLCJpYXQiOjE3NTg1MTgxOTQsImV4cCI6MTc2MTExMDE5NH0.l73aUH9lTBe-EazWe8Eydlzxd9SYZmbvBRs35tled-w"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

def test_update_property_details():
    # Create a new property to update later
    create_url = f"{BASE_URL}/api/properties"
    update_url_template = f"{BASE_URL}/api/properties/{{}}"
    
    # Use multipart/form-data for creation with images
    # Since this test case is about update, we'll upload one dummy image (empty) for create
    property_data_create = {
        'title': 'Test Property For Update',
        'description': 'Initial Description',
        'price': 150000,
        'property_type': 'Apartment',
        'location': 'Test City'
    }
    files_create = [
        ('images', ('image1.jpg', io.BytesIO(b'testimagecontent'), 'image/jpeg'))
    ]
    
    timeout = 30
    property_id = None
    
    try:
        # Create property first
        response_create = requests.post(
            create_url,
            headers=HEADERS,
            data=property_data_create,
            files=files_create,
            timeout=timeout,
        )
        assert response_create.status_code == 201, f"Property creation failed with status {response_create.status_code}, response: {response_create.text}"
        created_property = response_create.json()
        property_id = created_property.get("_id") or created_property.get("id") or created_property.get("propertyId")
        if not property_id:
            # Attempt to extract property id from response JSON keys if named differently
            # Otherwise fail
            raise AssertionError("Property ID not found in create response.")
        
        # Prepare update data: only title, description and price are allowed for update
        update_url = update_url_template.format(property_id)
        
        property_data_update = {
            'title': 'Updated Property Title',
            'description': 'Updated Description',
            'price': 175000
        }
        # For update also multipart/form-data is required, so no json param but data and files
        # No images to upload on update so omit files param
        
        response_update = requests.put(
            update_url,
            headers=HEADERS,
            data=property_data_update,
            timeout=timeout,
        )
        assert response_update.status_code == 200, f"Update failed with status {response_update.status_code}, response: {response_update.text}"
        
        # Optionally validate the response body contains updated details
        updated_property = response_update.json()
        assert updated_property.get("title") == property_data_update["title"], "Title not updated correctly"
        assert updated_property.get("description") == property_data_update["description"], "Description not updated correctly"
        # price may come as number or string - do type conversion for assertion
        updated_price = updated_property.get("price")
        assert updated_price is not None and float(updated_price) == float(property_data_update["price"]), "Price not updated correctly"

    except RequestException as e:
        raise AssertionError(f"Request failed: {str(e)}")
    finally:
        # Clean up: delete the created property if exists
        if property_id:
            try:
                delete_url = update_url_template.format(property_id)
                delete_resp = requests.delete(delete_url, headers=HEADERS, timeout=timeout)
                # Not asserting in finally, just attempt cleanup
            except Exception:
                pass

test_update_property_details()