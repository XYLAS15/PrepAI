export interface Question {
  id: string;
  category: 'DSA' | 'Behavioral' | 'System Design' | 'JavaScript' | 'Java' | 'Python';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  hints: string[];
  tags: string[];
  leetcodeUrl?: string;
}

export const QUESTION_BANK: Question[] = [
  // ── DSA ──────────────────────────────────────────────────────────────────
  {
    id: 'dsa-1', category: 'DSA', difficulty: 'Easy',
    title: 'Two Sum',
    description: 'Given an array of integers and a target, return indices of the two numbers that add up to target. Each input has exactly one solution.',
    hints: ['Use a hash map to store seen numbers', 'For each number, check if target - number exists in the map'],
    tags: ['Array', 'Hash Map'],
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
  },
  {
    id: 'dsa-2', category: 'DSA', difficulty: 'Medium',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Find the length of the longest substring without repeating characters.',
    hints: ['Sliding window technique', 'Use a Set to track characters in current window'],
    tags: ['Sliding Window', 'Hash Map', 'String'],
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  },
  {
    id: 'dsa-3', category: 'DSA', difficulty: 'Hard',
    title: 'Merge K Sorted Lists',
    description: 'You are given an array of k linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list.',
    hints: ['Use a min-heap (priority queue)', 'Add the first node from each list to the heap'],
    tags: ['Linked List', 'Heap', 'Divide & Conquer'],
    leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
  },
  {
    id: 'dsa-4', category: 'DSA', difficulty: 'Medium',
    title: 'Binary Tree Level Order Traversal',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values as an array of arrays.',
    hints: ['Use a queue (BFS)', 'Track the size of the queue at each level'],
    tags: ['BFS', 'Tree', 'Queue'],
    leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
  },
  {
    id: 'dsa-5', category: 'DSA', difficulty: 'Easy',
    title: 'Valid Parentheses',
    description: 'Given a string containing just brackets, determine if the input string is valid.',
    hints: ['Use a stack', 'Push open brackets, pop and match for close brackets'],
    tags: ['Stack', 'String'],
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
  },
  {
    id: 'dsa-6', category: 'DSA', difficulty: 'Medium',
    title: 'Coin Change',
    description: 'Given coins of different denominations and a total amount, find the minimum number of coins needed.',
    hints: ['Dynamic programming — bottom-up', 'dp[i] = min coins to make amount i'],
    tags: ['Dynamic Programming', 'Array'],
    leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
  },
  {
    id: 'dsa-7', category: 'DSA', difficulty: 'Medium',
    title: 'Number of Islands',
    description: 'Given a 2D grid of 1s and 0s, count the number of islands (connected groups of 1s).',
    hints: ['DFS or BFS from each unvisited 1', 'Mark visited cells as 0 to avoid revisiting'],
    tags: ['DFS', 'BFS', 'Graph', 'Union Find'],
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
  },
  {
    id: 'dsa-8', category: 'DSA', difficulty: 'Hard',
    title: 'Trapping Rain Water',
    description: 'Given n non-negative integers representing elevation maps, compute how much water can be trapped after raining.',
    hints: ['Two pointer approach', 'Track left_max and right_max for each position'],
    tags: ['Two Pointers', 'Dynamic Programming', 'Array'],
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
  },
  {
    id: 'dsa-9', category: 'DSA', difficulty: 'Easy',
    title: 'Reverse Linked List',
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    hints: ['Use three pointers: prev, curr, next', 'Iterative is simpler; recursive is elegant'],
    tags: ['Linked List', 'Recursion'],
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
  },
  {
    id: 'dsa-10', category: 'DSA', difficulty: 'Medium',
    title: 'LRU Cache',
    description: 'Design a data structure that follows LRU (Least Recently Used) cache constraints with O(1) get and put.',
    hints: ['Combine HashMap + Doubly Linked List', 'HashMap for O(1) lookup, DLL for O(1) eviction'],
    tags: ['Design', 'Hash Map', 'Linked List'],
    leetcodeUrl: 'https://leetcode.com/problems/lru-cache/',
  },

  // ── System Design ─────────────────────────────────────────────────────────
  {
    id: 'sd-1', category: 'System Design', difficulty: 'Medium',
    title: 'Design a URL Shortener',
    description: 'Design a service like bit.ly that converts long URLs to short ones and redirects users.',
    hints: ['Think about encoding (Base62)', 'Consider a distributed ID generator', 'Cache popular URLs'],
    tags: ['Hashing', 'Caching', 'Database', 'API'],
  },
  {
    id: 'sd-2', category: 'System Design', difficulty: 'Hard',
    title: 'Design Twitter Feed',
    description: 'Design a social media feed that shows tweets from people you follow, sorted by recency.',
    hints: ['Push vs Pull model for fanout', 'Consider celebrity accounts separately', 'Cache hot timelines'],
    tags: ['Fanout', 'Caching', 'NoSQL', 'Message Queue'],
  },
  {
    id: 'sd-3', category: 'System Design', difficulty: 'Hard',
    title: 'Design a Rate Limiter',
    description: 'Design a rate limiter that limits the number of requests a user can make in a time window.',
    hints: ['Token Bucket vs Sliding Window algorithm', 'Use Redis for distributed rate limiting', 'Consider edge cases: burst traffic'],
    tags: ['Redis', 'Algorithms', 'Distributed Systems'],
  },
  {
    id: 'sd-4', category: 'System Design', difficulty: 'Medium',
    title: 'Design a Notification System',
    description: 'Design a system that sends push notifications, emails and SMS to millions of users.',
    hints: ['Message queues for async processing', 'Retry with exponential backoff', 'Prioritize notification types'],
    tags: ['Message Queue', 'Kafka', 'Scalability'],
  },

  // ── Behavioral ────────────────────────────────────────────────────────────
  {
    id: 'beh-1', category: 'Behavioral', difficulty: 'Medium',
    title: 'Tell Me About a Time You Failed',
    description: 'Describe a significant professional failure. What happened, and what did you learn?',
    hints: ['Use STAR method', 'Be honest — interviewers respect self-awareness', 'Focus more on the learning than the failure'],
    tags: ['STAR', 'Self-Awareness', 'Growth Mindset'],
  },
  {
    id: 'beh-2', category: 'Behavioral', difficulty: 'Easy',
    title: 'Describe Your Greatest Strength',
    description: 'What is your greatest professional strength and how have you demonstrated it?',
    hints: ['Pick something relevant to the role', 'Back it with a concrete example', 'Connect it to impact'],
    tags: ['Self-Assessment', 'Communication'],
  },
  {
    id: 'beh-3', category: 'Behavioral', difficulty: 'Medium',
    title: 'How Do You Handle Conflict?',
    description: 'Tell me about a time you had a disagreement with a team member. How did you resolve it?',
    hints: ['Focus on collaboration, not "winning"', 'Show active listening skills', 'Describe the outcome for the team'],
    tags: ['Conflict Resolution', 'Teamwork', 'EQ'],
  },
  {
    id: 'beh-4', category: 'Behavioral', difficulty: 'Hard',
    title: 'Describe a Time You Led Without Authority',
    description: 'Have you ever driven a project or initiative where you had no formal authority over the team?',
    hints: ['Highlight influence through communication', 'Describe how you built consensus', 'Focus on outcome'],
    tags: ['Leadership', 'Influence', 'Initiative'],
  },
  {
    id: 'beh-5', category: 'Behavioral', difficulty: 'Medium',
    title: 'Why Do You Want to Leave Your Current Job?',
    description: 'What\'s driving you to look for a new opportunity?',
    hints: ['Stay positive — never badmouth your employer', 'Frame it as growth-seeking', 'Connect your motivation to this specific role'],
    tags: ['Motivation', 'Communication'],
  },

  // ── JavaScript ────────────────────────────────────────────────────────────
  {
    id: 'js-1', category: 'JavaScript', difficulty: 'Medium',
    title: 'Explain Event Loop',
    description: 'How does the JavaScript event loop work? Explain the call stack, task queue, and microtask queue.',
    hints: ['Start with single-threaded nature of JS', 'Differentiate macrotasks (setTimeout) from microtasks (Promises)', 'Walk through a concrete example'],
    tags: ['Async', 'Runtime', 'Concurrency'],
  },
  {
    id: 'js-2', category: 'JavaScript', difficulty: 'Hard',
    title: 'Implement a Debounce Function',
    description: 'Write a debounce function from scratch that delays invoking a function until after wait milliseconds.',
    hints: ['Use closure to store the timer', 'Clear the timer on each new call', 'Return a wrapper function'],
    tags: ['Closures', 'Functions', 'Performance'],
  },
  {
    id: 'js-3', category: 'JavaScript', difficulty: 'Easy',
    title: 'What is Closure?',
    description: 'Explain closures in JavaScript with a practical example.',
    hints: ['Inner function has access to outer function scope', 'Useful for data privacy', 'Classic example: counter function'],
    tags: ['Closures', 'Scope'],
  },

  // ── Java ──────────────────────────────────────────────────────────────────
  {
    id: 'java-1', category: 'Java', difficulty: 'Medium',
    title: 'HashMap vs ConcurrentHashMap',
    description: 'What are the differences between HashMap and ConcurrentHashMap? When would you use each?',
    hints: ['Thread safety', 'Segment locking vs full lock', 'Performance in concurrent access patterns'],
    tags: ['Concurrency', 'Collections', 'Threading'],
  },
  {
    id: 'java-2', category: 'Java', difficulty: 'Hard',
    title: 'Explain Java Memory Model',
    description: 'Describe the Java Memory Model, heap vs stack, and how the GC works.',
    hints: ['Heap: objects, Stack: method frames', 'Young generation vs Old generation', 'GC roots and reachability'],
    tags: ['JVM', 'Memory', 'GC'],
  },
];
