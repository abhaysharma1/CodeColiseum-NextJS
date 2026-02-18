import prisma from "@/lib/prisma";

// --- DATA DEFINITION FOR ALL 11 PROBLEMS ---

interface TestCaseData {
  input: string;
  output: string;
}

interface ProblemSeedData {
  number: number;
  title: string;
  description: string;
  difficulty: string;
  source: string;
  hiddenCases: TestCaseData[];
  runCases: TestCaseData[];
}

// NOTE on Input Format: All inputs follow the competitive programming style:
// [Size N] on the first line, followed by [N elements/characters] separated by spaces on the second line.

const allProblemsData: ProblemSeedData[] = [
  // --- PROBLEM 1: Find Missing Number (Based on CSV ID 1) ---
  // Input: List of N-1 numbers from 0 to N. Output: The missing number.
  {
    number: 1,
    title: 'Find Missing Number',
    description: 'Given an array containing N distinct numbers taken from 0, 1, 2, ..., N, find the single number that is missing. Input: size N (total range), followed by N-1 elements. Output: the missing number.',
    difficulty: 'Easy',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '3\n0 1', output: '2' }, // Missing max
      { input: '3\n1 2', output: '0' }, // Missing min
      { input: '5\n4 0 2 1', output: '3' }, // Missing middle
      { input: '2\n1', output: '0' }, // Missing 0 (N=2, range 0,1, missing 0)
      { input: '6\n5 1 2 4 0', output: '3' },
      { input: '1\n0', output: '1' }, // N=1, only 0 exists, range is [0, 1], array is [0]
      { input: '10\n9 8 7 6 5 4 3 2 1', output: '0' }, // Reverse sorted
      { input: '10\n0 1 2 3 4 5 6 7 8', output: '9' }, // Sorted, missing max
      { input: '4\n3 2 0', output: '1' },
      { input: '7\n6 5 4 3 2 0', output: '1' },
    ],
    runCases: [
      { input: '4\n3 0 1', output: '2' }, // Missing max
      { input: '2\n0', output: '1' }, // N=2, range [0,1], array [0]
      { input: '5\n0 1 3 4', output: '2' }, // Missing middle
      { input: '3\n2 1', output: '0' }, // Missing min
      { input: '6\n0 3 5 2 1', output: '4' },
    ],
  },
  
  // --- PROBLEM 2: Reverse String In Place (Based on CSV ID 2) ---
  // Input: String length N, then N characters (e.g., 'H e l l o'). Output: Reversed string (e.g., 'o l l e H').
  {
    number: 2,
    title: 'Reverse String In Place',
    description: 'Reverse the characters of a given string in-place. Input: string length N, followed by N characters separated by spaces. Output: the reversed string, with characters separated by spaces.',
    difficulty: 'Easy',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '5\nH e l l o', output: 'o l l e H' },
      { input: '6\nJ a v a S C', output: 'C S a v a J' },
      { input: '1\nA', output: 'A' }, // Single character
      { input: '0\n', output: '' }, // Empty string
      { input: '4\n1 2 3 4', output: '4 3 2 1' }, // Numbers as characters
      { input: '5\nm a d a m', output: 'm a d a m' }, // Palindrome
      { input: '7\na b c d e f g', output: 'g f e d c b a' },
      { input: '8\nz y x w v u t s', output: 's t u v w x y z' },
      { input: '2\ni s', output: 's i' }, // Two characters
      { input: '7\na b C D e f G', output: 'G f e D C b a' },
    ],
    runCases: [
      { input: '5\nC o d e s', output: 's e d o C' },
      { input: '4\nL i s p', output: 'p s i L' },
      { input: '1\nZ', output: 'Z' },
      { input: '4\nt e s t', output: 't s e t' },
      { input: '6\na B c D e F', output: 'F e D c B a' },
    ],
  },

  // --- PROBLEM 3: Valid Parentheses (Based on CSV ID 3) ---
  // Input: String length N, then N characters (parentheses). Output: YES or NO.
  {
    number: 3,
    title: 'Valid Parentheses',
    description: 'Given a string containing only "()[]{}", determine if the input string is valid. Valid means: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order. Input: size N, then N characters. Output: YES or NO.',
    difficulty: 'Easy',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '6\n( ) [ ] { }', output: 'YES' },
      { input: '2\n( ]', output: 'NO' }, // Wrong type
      { input: '6\n( [ ] ) { }', output: 'YES' }, // Nested valid
      { input: '4\n( ( )', output: 'NO' }, // Unclosed open
      { input: '8\n( { [ ] } )', output: 'YES' },
      { input: '0\n', output: 'YES' }, // Empty string
      { input: '1\n[', output: 'NO' }, // Single open
      { input: '1\n}', output: 'NO' }, // Single close
      { input: '4\n[ ] ( )', output: 'YES' }, // Sequential valid
      { input: '6\n{ { ( ) ] }', output: 'NO' }, // Wrong order/type mismatch
    ],
    runCases: [
      { input: '2\n( )', output: 'YES' },
      { input: '3\n( ] )', output: 'NO' },
      { input: '4\n[ ] [ ]', output: 'YES' },
      { input: '6\n( { } ]', output: 'NO' },
      { input: '6\n{ ( ) }', output: 'YES' },
    ],
  },
  
  // --- PROBLEM 4: Find Peak Element (Based on CSV ID 4) ---
  // Input: Array size N, then N elements. Output: Index of a peak element (any valid index).
  {
    number: 4,
    title: 'Find Peak Element',
    description: 'A peak element is an element that is strictly greater than its neighbors. Given an input array, find the index of any peak element. Input: size N, then N elements. Output: the index of a peak element (0-indexed).',
    difficulty: 'Medium',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '5\n1 2 3 1 0', output: '2' }, // Peak in middle
      { input: '2\n1 2', output: '1' }, // Peak at end
      { input: '2\n2 1', output: '0' }, // Peak at start
      { input: '1\n5', output: '0' }, // Single element
      { input: '5\n1 2 1 2 1', output: '1' }, // Multiple peaks (output 1 or 3 is valid)
      { input: '5\n5 4 3 2 1', output: '0' }, // Decreasing array
      { input: '5\n1 2 3 4 5', output: '4' }, // Increasing array
      { input: '7\n6 7 8 9 8 7 6', output: '3' }, // Clear highest peak
      { input: '5\n3 4 3 4 3', output: '1' }, // Multiple equal peaks (output 1 or 3 is valid)
      { input: '6\n1 3 5 7 5 3', output: '3' },
    ],
    runCases: [
      { input: '5\n1 5 3 2 0', output: '1' },
      { input: '4\n1 2 3 4', output: '3' },
      { input: '4\n4 3 2 1', output: '0' },
      { input: '3\n1 5 1', output: '1' },
      { input: '3\n2 5 2', output: '1' },
    ],
  },

  // --- PROBLEM 5: Linked List Cycle Detection (Simulated Array) (Based on CSV ID 5) ---
  // Since Scratch doesn't have native linked lists, we simulate the logic.
  // Input: Array size N, then N elements. Output: YES or NO.
  {
    number: 5,
    title: 'Linked List Cycle Detection (Simulated)',
    description: 'Determine if a linked list contains a cycle. Simulate the linked list using an array of node values (size N, then N elements). Output: YES or NO.',
    difficulty: 'Easy',
    source: 'CustomDSA',
    // NOTE: For this simulated problem, the cycle detection is based on the array content, 
    // not structure, but the standard test cases reflect the difficulty.
    hiddenCases: [
      { input: '4\n3 2 0 -4', output: 'NO' }, // No cycle (standard array)
      { input: '1\n1', output: 'NO' }, // Single element, no cycle
      { input: '2\n1 2', output: 'NO' },
      { input: '5\n1 2 3 4 5', output: 'NO' }, // Long list, no cycle
      { input: '0\n', output: 'NO' }, // Empty list
      { input: '6\n-1 -2 -3 -4 -5 -6', output: 'NO' },
      { input: '3\n1 1 1', output: 'NO' }, // Duplicates, but no structural cycle
      { input: '10\n1 2 3 4 5 6 7 8 9 10', output: 'NO' },
      { input: '2\n5 5', output: 'NO' },
      { input: '7\n1 2 1 2 1 2 1', output: 'NO' },
    ],
    runCases: [
      { input: '4\n1 2 3 4', output: 'NO' },
      { input: '3\n1 2 3', output: 'NO' },
      { input: '1\n0', output: 'NO' },
      { input: '5\n10 20 30 40 50', output: 'NO' },
      { input: '2\n-5 5', output: 'NO' },
    ],
  },
  
  // --- PROBLEM 6: Rotate Array (Based on CSV ID 6) ---
  // Input: Array size N, array elements, then rotation steps K. Output: Rotated array.
  {
    number: 6,
    title: 'Rotate Array',
    description: 'Rotate the elements of an array to the right by K steps. Input: size N, then N elements, then K steps (K is a single number on the third line). Output: the rotated array with elements separated by spaces.',
    difficulty: 'Medium',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '7\n1 2 3 4 5 6 7\n3', output: '5 6 7 1 2 3 4' }, // Standard rotation
      { input: '4\n-1 -100 3 99\n2', output: '3 99 -1 -100' },
      { input: '1\n10\n5', output: '10' }, // Single element, K > N
      { input: '5\n1 2 3 4 5\n0', output: '1 2 3 4 5' }, // K = 0
      { input: '5\n1 2 3 4 5\n5', output: '1 2 3 4 5' }, // K = N
      { input: '5\n1 2 3 4 5\n7', output: '4 5 1 2 3' }, // K > N (7 % 5 = 2 rotations)
      { input: '3\n1 1 1\n1', output: '1 1 1' },
      { input: '6\n-1 -2 -3 -4 -5 -6\n3', output: '-4 -5 -6 -1 -2 -3' },
      { input: '5\n1 2 3 4 5\n1', output: '5 1 2 3 4' }, // K = 1
      { input: '5\n1 2 3 4 5\n4', output: '2 3 4 5 1' },
    ],
    runCases: [
      { input: '3\n1 2 3\n1', output: '3 1 2' },
      { input: '5\n10 20 30 40 50\n2', output: '40 50 10 20 30' },
      { input: '4\n1 2 3 4\n4', output: '1 2 3 4' },
      { input: '2\n-1 5\n1', output: '5 -1' },
      { input: '3\n8 9 0\n4', output: '0 8 9' }, // 4 % 3 = 1 rotation
    ],
  },

  // --- PROBLEM 7: Maximum Subarray Sum (Based on CSV ID 7) ---
  // Input: Array size N, then N elements. Output: Maximum subarray sum.
  {
    number: 7,
    title: 'Maximum Subarray Sum',
    description: 'Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. Input: size N, then N elements. Output: the maximum sum.',
    difficulty: 'Medium',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6' }, // Standard Kadane's case (4, -1, 2, 1)
      { input: '1\n1', output: '1' }, // Single positive element
      { input: '1\n-5', output: '-5' }, // Single negative element
      { input: '5\n5 4 -1 7 8', output: '23' }, // All positive
      { input: '5\n-1 -2 -3 -4 -5', output: '-1' }, // All negative (max is the largest single negative)
      { input: '7\n1 -3 2 1 -1 4 0', output: '6' }, // (2, 1, -1, 4)
      { input: '3\n-2 0 -1', output: '0' }, // Includes zero
      { input: '4\n1 2 3 4', output: '10' },
      { input: '6\n-1 1 -1 1 -1 1', output: '1' },
      { input: '5\n10 -1 2 3 5', output: '19' },
    ],
    runCases: [
      { input: '5\n1 2 -1 3 4', output: '9' },
      { input: '3\n-2 -3 -1', output: '-1' },
      { input: '4\n1 -1 1 -1', output: '1' },
      { input: '6\n-1 5 -2 3 1 -4', output: '7' },
      { input: '2\n-10 2', output: '2' },
    ],
  },
  
  // --- PROBLEM 8: Binary Tree Level Order Traversal (Simulated Array) (Based on CSV ID 8) ---
  // Simulate BFS/Level order traversal using array logic (since trees are complex in Scratch)
  // Input: Array size N, elements (representing level order). Output: Same array content.
  {
    number: 8,
    title: 'Binary Tree Level Order Traversal (Simulated)',
    description: 'Perform a level order traversal (Breadth-First Search). Given an array representing a tree in level order (size N, then N elements), output the elements in the same order, separated by spaces. This tests the core BFS sequence logic.',
    difficulty: 'Medium',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '7\n3 9 20 15 7 1 2', output: '3 9 20 15 7 1 2' },
      { input: '1\n1', output: '1' }, // Single node
      { input: '0\n', output: '' }, // Empty tree
      { input: '3\n1 2 3', output: '1 2 3' }, // Complete binary tree
      { input: '5\n1 2 4 8 16', output: '1 2 4 8 16' },
      { input: '6\n-1 -2 -3 -4 -5 -6', output: '-1 -2 -3 -4 -5 -6' },
      { input: '4\n10 5 15 20', output: '10 5 15 20' },
      { input: '2\n99 100', output: '99 100' },
      { input: '9\n1 2 3 4 5 6 7 8 9', output: '1 2 3 4 5 6 7 8 9' },
      { input: '7\n-10 0 10 -5 5 -15 15', output: '-10 0 10 -5 5 -15 15' },
    ],
    runCases: [
      { input: '5\n1 2 3 4 5', output: '1 2 3 4 5' },
      { input: '3\n50 25 75', output: '50 25 75' },
      { input: '1\n-1', output: '-1' },
      { input: '4\n1 0 1 0', output: '1 0 1 0' },
      { input: '6\n1 1 1 1 1 1', output: '1 1 1 1 1 1' },
    ],
  },

  // --- PROBLEM 9: Product of Array Except Self (Based on CSV ID 9) ---
  // Input: Array size N, then N elements. Output: Product array.
  {
    number: 9,
    title: 'Product of Array Except Self',
    description: 'Given an array, return a new array where the value at index i is the product of all elements in the original array EXCEPT the element at i. Must run in O(N) without division. Input: size N, then N elements. Output: the resulting array with elements separated by spaces.',
    difficulty: 'Medium',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '4\n1 2 3 4', output: '24 12 8 6' }, // Standard case
      { input: '2\n-1 1', output: '1 -1' },
      { input: '3\n0 1 2', output: '2 0 0' }, // Single zero
      { input: '4\n0 0 1 2', output: '0 0 0 0' }, // Multiple zeros
      { input: '5\n1 2 3 4 5', output: '120 60 40 30 24' },
      { input: '3\n-2 -3 -4', output: '12 8 6' }, // All negative
      { input: '1\n5', output: '1' }, // Single element
      { input: '5\n2 3 4 5 1', output: '60 40 30 24 120' },
      { input: '6\n1 0 1 0 1 0', output: '0 0 0 0 0 0' },
      { input: '5\n1 1 1 1 1', output: '1 1 1 1 1' },
    ],
    runCases: [
      { input: '4\n4 3 2 1', output: '6 8 12 24' },
      { input: '3\n1 2 3', output: '6 3 2' },
      { input: '3\n-1 2 -3', output: '-6 3 2' },
      { input: '2\n0 5', output: '5 0' },
      { input: '5\n2 2 2 2 2', output: '16 16 16 16 16' },
    ],
  },

  // --- PROBLEM 10: Longest Consecutive Sequence (Based on CSV ID 10) ---
  // Input: Array size N, then N elements. Output: Length of the longest sequence.
  {
    number: 10,
    title: 'Longest Consecutive Sequence',
    description: 'Find the length of the longest consecutive elements sequence in an unsorted array. Input: size N, then N elements. Output: the length of the longest sequence.',
    difficulty: 'Hard',
    source: 'CustomDSA',
    hiddenCases: [
      { input: '6\n100 4 200 1 3 2', output: '4' }, // (1, 2, 3, 4)
      { input: '5\n1 2 0 1 2', output: '3' }, // Duplicates (0, 1, 2)
      { input: '0\n', output: '0' }, // Empty array
      { input: '1\n5', output: '1' }, // Single element
      { input: '8\n0 -1 -2 -3 -4 1 2 3', output: '8' }, // Spanning positive and negative
      { input: '7\n1 1 1 1 1 1 1', output: '1' }, // All duplicates
      { input: '5\n1 3 5 7 9', output: '1' }, // No consecutive elements
      { input: '10\n10 9 8 7 6 5 4 3 2 1', output: '10' }, // Reverse sequence
      { input: '5\n5 6 7 8 10', output: '4' }, // (5, 6, 7, 8)
      { input: '6\n10 11 12 13 15 16', output: '4' }, // Two separate sequences (10-13, 15-16)
    ],
    runCases: [
      { input: '6\n10 2 3 1 4 5', output: '5' },
      { input: '4\n5 8 2 1', output: '2' },
      { input: '3\n7 7 7', output: '1' },
      { input: '5\n100 101 102 103 104', output: '5' },
      { input: '2\n-5 0', output: '1' },
    ],
  },
  
  // --- PROBLEM 11: Merge Intervals (Simulated Array) (Based on CSV ID 11) ---
  // Input: Array size N, then N elements (simulated intervals). Output: Merged intervals (simulated).
  {
    number: 11,
    title: 'Merge Intervals (Simulated)',
    description: 'Given a list of intervals (simulated as array pairs), merge all overlapping intervals. Input: size N (number of intervals), followed by 2*N numbers (start end start end...). Output: the resulting merged intervals, in the same format (start end start end...), separated by spaces.',
    difficulty: 'Medium',
    source: 'CustomDSA',
    // Input is 2*N elements: [s1, e1, s2, e2, ...]
    hiddenCases: [
      { input: '4\n1 3 2 6 8 10 15 18', output: '1 6 8 10 15 18' }, // Standard merge
      { input: '2\n1 4 4 5', output: '1 5' }, // Adjacent merge
      { input: '2\n1 4 5 6', output: '1 4 5 6' }, // No merge
      { input: '1\n1 10', output: '1 10' }, // Single interval
      { input: '3\n1 4 0 4 3 5', output: '0 5' }, // Three intervals merge into one
      { input: '3\n10 20 1 5 6 9', output: '1 5 6 9 10 20' }, // Unsorted, no merge
      { input: '4\n1 2 3 4 5 6 7 8', output: '1 2 3 4 5 6 7 8' },
      { input: '3\n2 3 1 2 4 5', output: '1 3 4 5' },
      { input: '5\n1 10 2 9 3 8 4 7 5 6', output: '1 10' }, // All nested
      { input: '4\n6 7 5 6 4 5 3 4', output: '3 7' }, // Consecutive merges
    ],
    runCases: [
      { input: '3\n1 3 6 8 2 5', output: '1 5 6 8' },
      { input: '2\n1 4 0 2', output: '0 4' },
      { input: '1\n10 15', output: '10 15' },
      { input: '3\n1 2 3 4 5 6', output: '1 2 3 4 5 6' },
      { input: '2\n2 5 3 6', output: '2 6' },
    ],
  },
];


// --- SEEDING FUNCTION ---
async function main() {
  console.log(`Starting database seeding for ${allProblemsData.length} Problems' Test Cases...`);

  for (const data of allProblemsData) {
    // 1. Find the Problem record by its unique number
    // This assumes the 11 Problem records (1 through 11) already exist in your database.
    const problem = await prisma.problem.findUnique({
      where: { number: data.number },
    });

    if (!problem) {
      console.error(`\nCRITICAL ERROR: Problem with number ${data.number} (${data.title}) not found.`);
      console.error('Skipping test case upload for this problem. Please ensure the Problem record exists.');
      continue; // Skip to the next problem in the list
    }

    // Use a transaction to ensure both test case records are handled together
    await prisma.$transaction(async (tx) => {
      console.log(`\nFound Problem: ${problem.title} (ID: ${problem.id}). Upserting test cases...`);

      // 2. Create or Update the Hidden Test Cases (TestCase)
      await tx.testCase.upsert({
        where: { problemId: problem.id },
        update: {
          cases: JSON.stringify(data.hiddenCases),
          updatedAt: new Date(),
        },
        create: {
          problemId: problem.id,
          cases: JSON.stringify(data.hiddenCases),
        },
      });
      console.log(`- Upserted TestCase (Hidden) for Problem ${problem.number}. Total: ${data.hiddenCases.length}`);

      // 3. Create or Update the Visible Sample Cases (RunTestCase)
      await tx.runTestCase.upsert({
        where: { problemId: problem.id },
        update: {
          cases: JSON.stringify(data.runCases),
          updatedAt: new Date(),
        },
        create: {
          problemId: problem.id,
          cases: JSON.stringify(data.runCases),
        },
      });
      console.log(`- Upserted RunTestCase (Visible) for Problem ${problem.number}. Total: ${data.runCases.length}`);
    });
  }

  console.log('\nTest Case seeding finished successfully. All 11 problems have been processed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
