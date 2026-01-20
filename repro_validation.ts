
async function testValidation() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1ZTI5N2ExLWQ1MzktNGE0ZC1hMmJhLTI5ZTNlN2IwZDM2NCIsImVtYWlsIjoiamRvZUBleGFtcGxlLmNvbSIsInJvbGVzIjpbIlZQIl0sImlhdCI6MTc2ODQwOTg3NiwiZXhwIjoxNzY4NDk2Mjc2fQ.wdY0yniV3YYIRfbSfrrsWdCmtX6QXMz4dJaNzVCfOeE';

    const payload = {
        "username": "jdoe",
        "email": "jdoe@example.com",
        "password": "password123",
        "agencyId": "a4b4a99d-93eb-48fb-85d9-94fb50a5ead1",
        "roles": [
            1
        ],
        "phones": [
            "1234567890"
        ],
        "addresses": [
            {
                "address": "123 St",
                "country": "US",
                "addressType": "Permanent"
            }
        ],
        "profile": {
            "first_name": "John",
            "last_name": "Doe"
        }
    };

    try {
        console.log('Sending request with payload...');
        const response = await fetch('http://localhost:4000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testValidation();
