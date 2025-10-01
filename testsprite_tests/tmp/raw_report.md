
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Real-Estate-Management-System
- **Date:** 2025-09-27
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** test_register_new_agency
- **Test Code:** [TC001_test_register_new_agency.py](./TC001_test_register_new_agency.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 23, in <module>
  File "<string>", line 21, in test_register_new_agency
AssertionError: Expected status code 201, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/32c74a6a-8d7c-42a2-bace-66f7630634fd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** test_user_login
- **Test Code:** [TC002_test_user_login.py](./TC002_test_user_login.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 30, in <module>
  File "<string>", line 20, in test_user_login
AssertionError: Expected status 200, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/2ccc22ab-759e-4d5f-86b1-18b01ffddce4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** test_check_user_session
- **Test Code:** [TC003_test_check_user_session.py](./TC003_test_check_user_session.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/ae1066d8-d9f8-4037-8179-f37a72308f76
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** test_create_property_with_images
- **Test Code:** [TC004_test_create_property_with_images.py](./TC004_test_create_property_with_images.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 59, in <module>
  File "<string>", line 40, in test_create_property_with_images
AssertionError: Expected status 201, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/6009f406-6f53-4237-9c51-b3e790bfe341
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** test_get_all_properties
- **Test Code:** [TC005_test_get_all_properties.py](./TC005_test_get_all_properties.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/1339900a-b998-4ffe-b259-11081a995fae
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** test_update_property_details
- **Test Code:** [TC006_test_update_property_details.py](./TC006_test_update_property_details.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 89, in <module>
  File "<string>", line 42, in test_update_property_details
AssertionError: Property creation failed with status 500, response: {"message":"Error processing files","status":false}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/c1d339f0-3772-4ba6-9e93-cf21078f6812
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** test_delete_property
- **Test Code:** [TC007_test_delete_property.py](./TC007_test_delete_property.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 50, in <module>
  File "<string>", line 28, in test_delete_property
AssertionError: Created property ID not found in response.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/5e91ffbe-4531-42ea-91d9-ce3ba9741200
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** test_create_customer
- **Test Code:** [TC008_test_create_customer.py](./TC008_test_create_customer.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 26, in <module>
  File "<string>", line 21, in test_create_customer
AssertionError: Expected status 201, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/45081ae1-74a1-4bb0-9698-62df31bcd4cd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** test_schedule_meeting
- **Test Code:** [TC009_test_schedule_meeting.py](./TC009_test_schedule_meeting.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 125, in <module>
  File "<string>", line 30, in test_schedule_meeting
AssertionError: Failed to create customer: {"success":false,"message":"Full name is required"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/da5e8271-756f-4771-a24b-569f9a0c2438
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** test_share_property_with_customer
- **Test Code:** [TC010_test_share_property_with_customer.py](./TC010_test_share_property_with_customer.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 65, in <module>
  File "<string>", line 32, in test_share_property_with_customer
AssertionError: Property creation failed: {"success":false,"message":"Validation Error","errors":{"category":{"name":"ValidatorError","message":"Path `category` is required.","properties":{"message":"Path `category` is required.","type":"required","path":"category"},"kind":"required","path":"category"},"type":{"name":"ValidatorError","message":"Path `type` is required.","properties":{"message":"Path `type` is required.","type":"required","path":"type"},"kind":"required","path":"type"}}}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/61f81957-52d5-4f04-bd96-3440fee1a28f/620fd3b7-fa3f-4913-aaec-71a1fcd07171
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **20.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---