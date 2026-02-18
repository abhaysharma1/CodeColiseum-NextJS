// Data generators for creating synthetic test data

const generateRandomEmail = () => {
  const domains = ['test.com', 'example.com', 'demo.org'];
  const randomString = Math.random().toString(36).substring(2, 15);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `test-${randomString}@${domain}`;
};

const generateRandomName = () => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateUser = (role = 'STUDENT') => ({
  name: generateRandomName(),
  email: generateRandomEmail(),
  password: 'StressTest2024!',
  role: role
});

const generateProblem = () => ({
  title: `Problem ${Math.floor(Math.random() * 10000)}`,
  description: `This is a test problem description for stress testing. It contains multiple paragraphs and demonstrates various problem types. The problem involves algorithmic thinking and complex data structures.

  **Input Format:**
  - First line contains integer N
  - Second line contains N space-separated integers
  
  **Output Format:**
  - Single integer representing the result
  
  **Constraints:**
  - 1 <= N <= 1000
  - 1 <= A[i] <= 10^6
  
  **Example:**
  Input:
  5
  1 2 3 4 5
  
  Output:
  15`,
  difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)],
  source: 'Stress Test Generator'
});

const generateTestCase = () => ({
  input: Math.floor(Math.random() * 100).toString(),
  output: Math.floor(Math.random() * 1000).toString()
});

const generateTestCases = (count = 5) => {
  const cases = [];
  for (let i = 0; i < count; i++) {
    cases.push(generateTestCase());
  }
  return cases;
};

const generateCode = (language = 'javascript') => {
  const codeSamples = {
    javascript: `
function solution(input) {
    const lines = input.trim().split('\\n');
    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    return arr.reduce((sum, num) => sum + num, 0);
}

module.exports = solution;
`,
    python: `
def solution(input_str):
    lines = input_str.strip().split('\\n')
    n = int(lines[0])
    arr = list(map(int, lines[1].split()))
    return sum(arr)
`,
    cpp: `
#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << accumulate(arr.begin(), arr.end(), 0) << endl;
    return 0;
}
`,
    java: `
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for(int i = 0; i < n; i++) {
            sum += sc.nextInt();
        }
        System.out.println(sum);
    }
}
`
  };
  
  return codeSamples[language] || codeSamples.javascript;
};

const generateExam = () => ({
  title: `Stress Test Exam ${Math.floor(Math.random() * 1000)}`,
  description: 'This is a stress test exam generated for API testing purposes.',
  durationMin: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
  isPublished: Math.random() > 0.5,
  sebEnabled: false,
  startDate: new Date(Date.now() + Math.random() * 86400000).toISOString(), // Random time in next 24 hours
  endDate: new Date(Date.now() + 86400000 * 7).toISOString() // A week from now
});

const generateGroup = () => ({
  name: `Test Group ${Math.floor(Math.random() * 1000)}`,
  description: 'A test group created for stress testing purposes',
  allowJoinByLink: Math.random() > 0.5,
  emails: [
    generateRandomEmail(),
    generateRandomEmail(),
    generateRandomEmail()
  ]
});

const generateSubmission = () => ({
  language: ['javascript', 'python', 'cpp', 'java'][Math.floor(Math.random() * 4)],
  sourceCode: generateCode()
});

const generateSearchQueries = () => [
  'array',
  'sort',
  'binary',
  'tree',
  'graph',
  'dynamic',
  'programming',
  'algorithm',
  'data structure',
  'string',
  'math',
  'greedy',
  'backtrack'
];

const generateRandomSearchQuery = () => {
  const queries = generateSearchQueries();
  return queries[Math.floor(Math.random() * queries.length)];
};

const generatePaginationParams = () => ({
  take: Math.floor(Math.random() * 20) + 5, // 5-25 items
  skip: Math.floor(Math.random() * 50) // Skip 0-50 items
});

const generateHeartbeatData = () => ({
  timestamp: new Date().toISOString(),
  windowFocus: Math.random() > 0.1, // 90% chance of window being focused
  tabActive: Math.random() > 0.05 // 95% chance of tab being active
});

module.exports = {
  generateUser,
  generateProblem,
  generateTestCase,
  generateTestCases,
  generateCode,
  generateExam,
  generateGroup,
  generateSubmission,
  generateRandomEmail,
  generateRandomName,
  generateRandomSearchQuery,
  generatePaginationParams,
  generateHeartbeatData,
  generateSearchQueries
};