# API Integration Examples

All examples use placeholder credentials (`osk_example_...`) and can be tested directly against OsterdOps development and production environments.

---

## 1. Gateway Inference via cURL

```bash
curl -X POST https://api.osterdops.com/api/v1/chat/completions \
  -H "Authorization: Bearer osk_example_94f2a188c9f4d1e204b78912" \
  -H "Content-Type: application/json" \
  -H "x-osterdops-request-id: req_curl_test_001" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Hello OsterdOps!" }
    ],
    "temperature": 0.7
  }'
```

---

## 2. Idempotent Project Creation via cURL

```bash
curl -X POST https://api.osterdops.com/api/v1/projects \
  -H "Authorization: Bearer osk_example_94f2a188c9f4d1e204b78912" \
  -H "Idempotency-Key: idemp_proj_create_9912a" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fraud Detection Microservice",
    "spendLimitMonthly": 500
  }'
```

---

## 3. Handling 429 & Budget Limits in Python

```python
import requests
import time

def call_gateway_with_backoff(api_key, model, messages, max_retries=3):
    url = "https://api.osterdops.com/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {"model": model, "messages": messages}

    for attempt in range(max_retries):
        resp = requests.post(url, json=payload, headers=headers)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            err_data = resp.json().get("error", {})
            if err_data.get("code") == "BUDGET_EXCEEDED":
                raise Exception("Budget spend cap exceeded. Request blocked under HARD enforcement.")
            retry_after = int(resp.headers.get("Retry-After", 2 ** attempt))
            time.sleep(retry_after)
        else:
            resp.raise_for_status()

    raise Exception("Max retries exceeded.")
```
