export const getDsaQuestionLink = (name: string): string => {
  const links: Record<string, string> = {
    // Arrays & Hashing
    "Two Sum": "https://leetcode.com/problems/two-sum/",
    "Contains Duplicate": "https://leetcode.com/problems/contains-duplicate/",
    "Valid Anagram": "https://leetcode.com/problems/valid-anagram/",
    "Group Anagrams": "https://leetcode.com/problems/group-anagrams/",
    "Top K Frequent Elements": "https://leetcode.com/problems/top-k-frequent-elements/",
    "Product of Array Except Self": "https://leetcode.com/problems/product-of-array-except-self/",
    
    // Two Pointers
    "Valid Palindrome": "https://leetcode.com/problems/valid-palindrome/",
    "Two Sum II": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    "3Sum": "https://leetcode.com/problems/3sum/",
    "Container With Most Water": "https://leetcode.com/problems/container-with-most-water/",
    "Trapping Rain Water": "https://leetcode.com/problems/trapping-rain-water/",
    
    // Sliding Window
    "Best Time to Buy and Sell Stock": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "Longest Substring Without Repeating": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "Longest Repeating Character Replacement": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "Minimum Window Substring": "https://leetcode.com/problems/minimum-window-substring/",
    
    // Stack
    "Valid Parentheses": "https://leetcode.com/problems/valid-parentheses/",
    "Min Stack": "https://leetcode.com/problems/min-stack/",
    "Evaluate Reverse Polish Notation": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "Daily Temperatures": "https://leetcode.com/problems/daily-temperatures/",
    "Largest Rectangle in Histogram": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    
    // Binary Search
    "Binary Search": "https://leetcode.com/problems/binary-search/",
    "Search a 2D Matrix": "https://leetcode.com/problems/search-a-2d-matrix/",
    "Koko Eating Bananas": "https://leetcode.com/problems/koko-eating-bananas/",
    "Search in Rotated Sorted Array": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "Median of Two Sorted Arrays": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    
    // Linked List
    "Reverse Linked List": "https://leetcode.com/problems/reverse-linked-list/",
    "Merge Two Sorted Lists": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "Linked List Cycle": "https://leetcode.com/problems/linked-list-cycle/",
    "Remove Nth Node From End": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "LRU Cache": "https://leetcode.com/problems/lru-cache/",
    
    // Trees
    "Invert Binary Tree": "https://leetcode.com/problems/invert-binary-tree/",
    "Maximum Depth": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "Same Tree": "https://leetcode.com/problems/same-tree/",
    "Binary Tree Level Order Traversal": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "Validate BST": "https://leetcode.com/problems/validate-binary-search-tree/",
    "Lowest Common Ancestor": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "Serialize and Deserialize": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    
    // Tries
    "Implement Trie": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "Design Add and Search Words": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "Word Search II": "https://leetcode.com/problems/word-search-ii/",
    
    // Heap / Priority Queue
    "Kth Largest Element": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "Last Stone Weight": "https://leetcode.com/problems/last-stone-weight/",
    "K Closest Points": "https://leetcode.com/problems/k-closest-points-to-origin/",
    "Task Scheduler": "https://leetcode.com/problems/task-scheduler/",
    "Design Twitter": "https://leetcode.com/problems/design-twitter/",
    "Find Median from Data Stream": "https://leetcode.com/problems/find-median-from-data-stream/",
    
    // Backtracking
    "Subsets": "https://leetcode.com/problems/subsets/",
    "Combination Sum": "https://leetcode.com/problems/combination-sum/",
    "Permutations": "https://leetcode.com/problems/permutations/",
    "Word Search": "https://leetcode.com/problems/word-search/",
    "Palindrome Partitioning": "https://leetcode.com/problems/palindrome-partitioning/",
    "N-Queens": "https://leetcode.com/problems/n-queens/",
    
    // Graphs
    "Number of Islands": "https://leetcode.com/problems/number-of-islands/",
    "Clone Graph": "https://leetcode.com/problems/clone-graph/",
    "Pacific Atlantic Water Flow": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "Course Schedule": "https://leetcode.com/problems/course-schedule/",
    "Graph Valid Tree": "https://leetcode.com/problems/graph-valid-tree/",
    "Number of Connected Components": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    
    // Advanced Graphs
    "Dijkstra's Algorithm": "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm",
    "Prim's Algorithm": "https://en.wikipedia.org/wiki/Prim%27s_algorithm",
    "Kruskal's Algorithm": "https://en.wikipedia.org/wiki/Kruskal%27s_algorithm",
    "Bellman-Ford": "https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm",
    "Network Delay Time": "https://leetcode.com/problems/network-delay-time/",
    "Cheapest Flights Within K Stops": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    
    // Dynamic Programming
    "Climbing Stairs": "https://leetcode.com/problems/climbing-stairs/",
    "Coin Change": "https://leetcode.com/problems/coin-change/",
    "Longest Increasing Subsequence": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "Longest Common Subsequence": "https://leetcode.com/problems/longest-common-subsequence/",
    "Word Break": "https://leetcode.com/problems/word-break/",
    "House Robber": "https://leetcode.com/problems/house-robber/",
    "Unique Paths": "https://leetcode.com/problems/unique-paths/",
    "Edit Distance": "https://leetcode.com/problems/edit-distance/",
    
    // Greedy
    "Maximum Subarray": "https://leetcode.com/problems/maximum-subarray/",
    "Jump Game": "https://leetcode.com/problems/jump-game/",
    "Gas Station": "https://leetcode.com/problems/gas-station/",
    "Hand of Straights": "https://leetcode.com/problems/hand-of-straights/",
    "Partition Labels": "https://leetcode.com/problems/partition-labels/",
    
    // Intervals
    "Insert Interval": "https://leetcode.com/problems/insert-interval/",
    "Merge Intervals": "https://leetcode.com/problems/merge-intervals/",
    "Non-overlapping Intervals": "https://leetcode.com/problems/non-overlapping-intervals/",
    "Meeting Rooms": "https://leetcode.com/problems/meeting-rooms/",
    "Meeting Rooms II": "https://leetcode.com/problems/meeting-rooms-ii/",
    
    // Bit Manipulation
    "Single Number": "https://leetcode.com/problems/single-number/",
    "Number of 1 Bits": "https://leetcode.com/problems/number-of-1-bits/",
    "Counting Bits": "https://leetcode.com/problems/counting-bits/",
    "Reverse Bits": "https://leetcode.com/problems/reverse-bits/",
    "Missing Number": "https://leetcode.com/problems/missing-number/",
    "Sum of Two Integers": "https://leetcode.com/problems/sum-of-two-integers/",
    
    // System Design
    "URL Shortener": "https://github.com/donnemartin/system-design-primer#design-a-url-shortener-like-bitly",
    "Web Crawler": "https://github.com/donnemartin/system-design-primer#design-a-web-crawler",
    "Notification Service": "https://github.com/donnemartin/system-design-primer",
    "Rate Limiter": "https://github.com/donnemartin/system-design-primer",
    "Chat System": "https://github.com/donnemartin/system-design-primer",
    "News Feed": "https://github.com/donnemartin/system-design-primer"
  };
  
  return links[name] || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(name)}`;
};
