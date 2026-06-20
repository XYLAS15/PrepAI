package com.interviewprep.roadmap.service;

import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Static catalog of DSA topics with difficulty levels, subtopics, and prerequisites.
 * This is pure configuration data — no AI involved.
 */
@Component
public class DsaTopicCatalog {

    public record Topic(
            String name,
            String category,
            String difficulty,
            List<String> subtopics,
            List<String> prerequisites,
            int estimatedHours,
            List<String> resources
    ) {}

    private static final List<Topic> ALL_TOPICS = List.of(
            new Topic("Arrays & Hashing", "DATA_STRUCTURES", "EASY",
                    List.of("Two Sum", "Contains Duplicate", "Valid Anagram", "Group Anagrams",
                            "Top K Frequent Elements", "Product of Array Except Self"),
                    List.of(),
                    8, List.of("NeetCode Arrays", "LeetCode Array Problems")),

            new Topic("Two Pointers", "ALGORITHMS", "EASY",
                    List.of("Valid Palindrome", "Two Sum II", "3Sum", "Container With Most Water",
                            "Trapping Rain Water"),
                    List.of("Arrays & Hashing"),
                    6, List.of("NeetCode Two Pointers")),

            new Topic("Sliding Window", "ALGORITHMS", "MEDIUM",
                    List.of("Best Time to Buy and Sell Stock", "Longest Substring Without Repeating",
                            "Longest Repeating Character Replacement", "Minimum Window Substring"),
                    List.of("Arrays & Hashing"),
                    8, List.of("NeetCode Sliding Window")),

            new Topic("Stack", "DATA_STRUCTURES", "EASY",
                    List.of("Valid Parentheses", "Min Stack", "Evaluate Reverse Polish Notation",
                            "Daily Temperatures", "Largest Rectangle in Histogram"),
                    List.of("Arrays & Hashing"),
                    6, List.of("NeetCode Stack")),

            new Topic("Binary Search", "ALGORITHMS", "MEDIUM",
                    List.of("Binary Search", "Search a 2D Matrix", "Koko Eating Bananas",
                            "Search in Rotated Sorted Array", "Median of Two Sorted Arrays"),
                    List.of("Arrays & Hashing"),
                    8, List.of("NeetCode Binary Search")),

            new Topic("Linked List", "DATA_STRUCTURES", "MEDIUM",
                    List.of("Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle",
                            "Remove Nth Node From End", "LRU Cache"),
                    List.of("Arrays & Hashing"),
                    8, List.of("NeetCode Linked List")),

            new Topic("Trees", "DATA_STRUCTURES", "MEDIUM",
                    List.of("Invert Binary Tree", "Maximum Depth", "Same Tree",
                            "Binary Tree Level Order Traversal", "Validate BST",
                            "Lowest Common Ancestor", "Serialize and Deserialize"),
                    List.of("Stack", "Linked List"),
                    12, List.of("NeetCode Trees")),

            new Topic("Tries", "DATA_STRUCTURES", "MEDIUM",
                    List.of("Implement Trie", "Design Add and Search Words", "Word Search II"),
                    List.of("Trees"),
                    4, List.of("NeetCode Tries")),

            new Topic("Heap / Priority Queue", "DATA_STRUCTURES", "MEDIUM",
                    List.of("Kth Largest Element", "Last Stone Weight", "K Closest Points",
                            "Task Scheduler", "Design Twitter", "Find Median from Data Stream"),
                    List.of("Arrays & Hashing", "Trees"),
                    8, List.of("NeetCode Heap")),

            new Topic("Backtracking", "ALGORITHMS", "MEDIUM",
                    List.of("Subsets", "Combination Sum", "Permutations", "Word Search",
                            "Palindrome Partitioning", "N-Queens"),
                    List.of("Trees"),
                    10, List.of("NeetCode Backtracking")),

            new Topic("Graphs", "DATA_STRUCTURES", "MEDIUM",
                    List.of("Number of Islands", "Clone Graph", "Pacific Atlantic Water Flow",
                            "Course Schedule", "Graph Valid Tree", "Number of Connected Components"),
                    List.of("Trees"),
                    12, List.of("NeetCode Graphs")),

            new Topic("Advanced Graphs", "ALGORITHMS", "HARD",
                    List.of("Dijkstra's Algorithm", "Prim's Algorithm", "Kruskal's Algorithm",
                            "Bellman-Ford", "Network Delay Time", "Cheapest Flights Within K Stops"),
                    List.of("Graphs", "Heap / Priority Queue"),
                    10, List.of("NeetCode Advanced Graphs")),

            new Topic("Dynamic Programming", "ALGORITHMS", "HARD",
                    List.of("Climbing Stairs", "Coin Change", "Longest Increasing Subsequence",
                            "Longest Common Subsequence", "Word Break", "House Robber",
                            "Unique Paths", "Edit Distance"),
                    List.of("Arrays & Hashing", "Trees"),
                    16, List.of("NeetCode Dynamic Programming")),

            new Topic("Greedy", "ALGORITHMS", "MEDIUM",
                    List.of("Maximum Subarray", "Jump Game", "Gas Station",
                            "Hand of Straights", "Partition Labels"),
                    List.of("Arrays & Hashing"),
                    6, List.of("NeetCode Greedy")),

            new Topic("Intervals", "ALGORITHMS", "MEDIUM",
                    List.of("Insert Interval", "Merge Intervals", "Non-overlapping Intervals",
                            "Meeting Rooms", "Meeting Rooms II"),
                    List.of("Arrays & Hashing", "Greedy"),
                    6, List.of("NeetCode Intervals")),

            new Topic("Bit Manipulation", "ALGORITHMS", "MEDIUM",
                    List.of("Single Number", "Number of 1 Bits", "Counting Bits",
                            "Reverse Bits", "Missing Number", "Sum of Two Integers"),
                    List.of(),
                    4, List.of("NeetCode Bit Manipulation")),

            new Topic("System Design", "SYSTEM_DESIGN", "HARD",
                    List.of("URL Shortener", "Web Crawler", "Notification Service",
                            "Rate Limiter", "Chat System", "News Feed"),
                    List.of("Graphs", "Heap / Priority Queue"),
                    20, List.of("System Design Primer", "Designing Data-Intensive Applications"))
    );

    public List<Topic> getAllTopics() {
        return ALL_TOPICS;
    }

    public List<Topic> getTopicsByDifficulty(String difficulty) {
        return ALL_TOPICS.stream()
                .filter(t -> t.difficulty().equals(difficulty))
                .toList();
    }

    public List<Topic> getTopicsByCategory(String category) {
        return ALL_TOPICS.stream()
                .filter(t -> t.category().equals(category))
                .toList();
    }

    public Optional<Topic> findByName(String name) {
        return ALL_TOPICS.stream()
                .filter(t -> t.name().equalsIgnoreCase(name))
                .findFirst();
    }

    /**
     * Returns topics in dependency order (prerequisites first).
     */
    public List<Topic> getTopologicallySorted() {
        Map<String, Topic> topicMap = new LinkedHashMap<>();
        ALL_TOPICS.forEach(t -> topicMap.put(t.name(), t));

        Set<String> visited = new LinkedHashSet<>();
        List<Topic> sorted = new ArrayList<>();

        for (Topic topic : ALL_TOPICS) {
            topologicalSort(topic, topicMap, visited, sorted);
        }

        return sorted;
    }

    private void topologicalSort(Topic topic, Map<String, Topic> topicMap,
                                  Set<String> visited, List<Topic> sorted) {
        if (visited.contains(topic.name())) return;
        visited.add(topic.name());

        for (String prereq : topic.prerequisites()) {
            Topic prereqTopic = topicMap.get(prereq);
            if (prereqTopic != null) {
                topologicalSort(prereqTopic, topicMap, visited, sorted);
            }
        }

        sorted.add(topic);
    }
}
