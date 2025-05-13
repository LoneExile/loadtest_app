import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Use the BASE_URL from environment variable or default to the provided URL
const BASE_URL = __ENV.BASE_URL || 'https://web-app-github-5nvhdinu-mniwx.ondigitalocean.app';
const API_ENDPOINT = `${BASE_URL}/api/checkEtax`;

export const options = {
  // Default options for CLI execution
  vus: 10,
  duration: '30s',
  
  // Scenario-based configuration
  scenarios: {
    // Smoke test with constant VUs
    smoke: {
      exec: "testEtaxAPI",
      executor: "constant-vus",
      vus: 1,
      duration: "10s",
    },
    // Load test with ramping VUs
    load: {
      exec: "testEtaxAPI",
      executor: "ramping-vus",
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '10s', target: 0 },
      ],
      startTime: "10s",
    },
    // Stress test with constant arrival rate
    stress: {
      exec: "testEtaxAPI",
      executor: 'constant-arrival-rate',
      duration: '30s',
      rate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      startTime: "60s",
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    http_req_duration: ['p(95)<550', 'p(99)<1000'], // 95% of requests should be below 550ms, 99% below 1s
    'etax_response_validation': ['rate>0.99'], // 99% of responses should be valid
  },
};

// Custom metrics
const requests = new Counter('etax_requests');
const responseTimes = new Trend('etax_response_times');
const validResponses = new Rate('etax_response_validation');

export function setup() {
  // Verify the API is accessible before starting the test
  let res = http.post(API_ENDPOINT);
  if (res.status !== 200) {
    throw new Error(`API is not accessible. Got status code ${res.status}. Exiting.`);
  }
  console.log("Setup completed successfully. API is accessible.");
  
  // Validate the response structure
  try {
    let body = JSON.parse(res.body);
    if (!body.ms || !body.result || !body.result.cusId || !body.result.payermaxCardld) {
      throw new Error("Response structure is not as expected");
    }
  } catch (e) {
    throw new Error(`Failed to parse response or invalid structure: ${e.message}`);
  }
  
  return { startTime: new Date() };
}

export function testEtaxAPI() {
  // Send POST request to the API
  // You can add request payload here if needed
  const payload = {}; // Empty payload as the example doesn't show any required data
  
  const start = new Date();
  const res = http.post(API_ENDPOINT, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const end = new Date();
  
  // Record request count
  requests.add(1);
  
  // Record response time
  const responseTime = end - start;
  responseTimes.add(responseTime);
  
  // Check if response is as expected
  let isValidResponse = false;
  try {
    const responseBody = JSON.parse(res.body);
    
    isValidResponse = check(res, {
      "status is 200": (r) => r.status === 200,
      "response has 'ms' field": () => responseBody.ms === "good",
      "response has customer ID": () => responseBody.result && responseBody.result.cusId === "Customer001",
      "response has payermax card ID": () => responseBody.result && responseBody.result.payermaxCardld === "00000001",
    });
    
    // Log response details
    if (isValidResponse) {
      console.log(`✅ Response received in ${responseTime}ms: Customer ID: ${responseBody.result.cusId}, Card ID: ${responseBody.result.payermaxCardld}`);
    } else {
      console.log(`❌ Invalid response: Status ${res.status}, Body: ${res.body}`);
    }
  } catch (e) {
    console.log(`❌ Error parsing response: ${e.message}, Body: ${res.body}`);
    isValidResponse = false;
  }
  
  // Record validation result
  validResponses.add(isValidResponse);
  
  // Add a small sleep to prevent overwhelming the server
  sleep(0.1);
}

export function teardown(data) {
  // Calculate test duration
  if (data && data.startTime) {
    const endTime = new Date();
    const duration = (endTime - data.startTime) / 1000;
    console.log(`Test completed in ${duration.toFixed(2)} seconds.`);
  } else {
    console.log("Test completed.");
  }
}

export function handleSummary(data) {
  return {
    'etax-api-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

// Default function that will be executed when running with CLI parameters
export default function() {
  testEtaxAPI();
}
