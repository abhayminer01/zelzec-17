import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 2000 }, // Ramp up to 2000 users
        { duration: '1m', target: 5000 },  // 5000 users
        { duration: '1m', target: 10000 }, // Peak at 10000 users
        { duration: '30s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

export default function () {
    // Target a public endpoint that doesn't require auth to test raw throughput/handling
    // Adjust URL/Port if necessary
    const BASE_URL = 'http://localhost:5000/api/v1/visitor/check'; // Assuming port 5000 and this route exists or similar

    const res = http.get(BASE_URL);

    check(res, {
        'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
        'not 500': (r) => r.status !== 500,
    });

    sleep(1);
}
