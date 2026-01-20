
import fs from 'fs';

async function testValidation() {
    // wait for 2 seconds to ensure server restart if it was lagging
    await new Promise(resolve => setTimeout(resolve, 2000));

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1ZTI5N2ExLWQ1MzktNGE0ZC1hMmJhLTI5ZTNlN2IwZDM2NCIsImVtYWlsIjoiamRvZUBleGFtcGxlLmNvbSIsInJvbGVzIjpbIlZQIl0sImlhdCI6MTc2ODQwOTg3NiwiZXhwIjoxNzY4NDk2Mjc2fQ.wdY0yniV3YYIRfbSfrrsWdCmtX6QXMz4dJaNzVCfOeE';

    const payload = {
        "username": `jdoe_${Date.now()}`,
        "email": `jdoe_${Date.now()}@example.com`,
        "password": "password123",
        // "agencyId": "a4b4a99d-93eb-48fb-85d9-94fb50a5ead1",
        // "roles": [
        //     1
        // ],
        "phones": [
            `${Math.floor(Math.random() * 10000000000)}`
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
        console.log('Sending request...');
        const response = await fetch('http://localhost:5000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const result = {
            status: response.status,
            data: data
        };
        fs.writeFileSync('repro_output.json', JSON.stringify(result, null, 2));
        console.log('Response written to repro_output.json');

    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('repro_output.json', JSON.stringify({ error: error.toString() }));
    }
}

testValidation();
