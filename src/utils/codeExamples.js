// 示例代码库
export const codeExamples = [
  {
    id: "permutation",
    name: "全排列（回溯）",
    language: "cpp",
    category: "回溯算法",
    code: `class Solution {
public:
    void backtrack(vector<vector<int>>& res, vector<int>& output, int first, int len){
        // 所有数都填完了
        if (first == len) {
            res.emplace_back(output);
            return;
        }
        for (int i = first; i < len; ++i) {
            // 动态维护数组
            swap(output[i], output[first]);
            // 继续递归填下一个数
            backtrack(res, output, first + 1, len);
            // 撤销操作
            swap(output[i], output[first]);
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int> > res;
        backtrack(res, nums, 0, (int)nums.size());
        return res;
    }
};`,
  },
  {
    id: "quicksort",
    name: "快速排序",
    language: "python",
    category: "排序算法",
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# 示例使用
numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quick_sort(numbers)
print(sorted_numbers)`,
  },
  {
    id: "fibonacci",
    name: "斐波那契数列（动态规划）",
    language: "javascript",
    category: "动态规划",
    code: `function fibonacci(n) {
    if (n <= 1) return n;
    
    // 使用动态规划优化
    const dp = [0, 1];
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// 示例使用
console.log(fibonacci(10)); // 输出: 55`,
  },
  {
    id: "binary-search",
    name: "二分查找",
    language: "java",
    category: "搜索算法",
    code: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // 未找到
    }
}`,
  },
  {
    id: "tree-traversal",
    name: "二叉树遍历（递归）",
    language: "cpp",
    category: "树算法",
    code: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

class Solution {
public:
    // 前序遍历：根 -> 左 -> 右
    void preorder(TreeNode* root, vector<int>& result) {
        if (!root) return;
        result.push_back(root->val);
        preorder(root->left, result);
        preorder(root->right, result);
    }
    
    // 中序遍历：左 -> 根 -> 右
    void inorder(TreeNode* root, vector<int>& result) {
        if (!root) return;
        inorder(root->left, result);
        result.push_back(root->val);
        inorder(root->right, result);
    }
    
    // 后序遍历：左 -> 右 -> 根
    void postorder(TreeNode* root, vector<int>& result) {
        if (!root) return;
        postorder(root->left, result);
        postorder(root->right, result);
        result.push_back(root->val);
    }
};`,
  },
  {
    id: "dijkstra",
    name: "Dijkstra 最短路径",
    language: "python",
    category: "图算法",
    code: `import heapq

def dijkstra(graph, start):
    # 初始化距离字典
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    
    # 优先队列：(距离, 节点)
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_node in visited:
            continue
        visited.add(current_node)
        
        # 更新邻居节点的距离
        for neighbor, weight in graph[current_node].items():
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances`,
  },
  {
    id: "two-sum",
    name: "两数之和（哈希表）",
    language: "javascript",
    category: "哈希表",
    code: `function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return null;
}

// 示例使用
const nums = [2, 7, 11, 15];
const target = 9;
console.log(twoSum(nums, target)); // 输出: [0, 1]`,
  },
  {
    id: "lru-cache",
    name: "LRU 缓存",
    language: "go",
    category: "数据结构",
    code: `package main

type Node struct {
    key, val   int
    prev, next *Node
}

type LRUCache struct {
    capacity   int
    cache      map[int]*Node
    head, tail *Node
}

func Constructor(capacity int) LRUCache {
    head := &Node{}
    tail := &Node{}
    head.next = tail
    tail.prev = head
    
    return LRUCache{
        capacity: capacity,
        cache:    make(map[int]*Node),
        head:     head,
        tail:     tail,
    }
}

func (this *LRUCache) Get(key int) int {
    if node, ok := this.cache[key]; ok {
        this.moveToHead(node)
        return node.val
    }
    return -1
}

func (this *LRUCache) Put(key int, value int) {
    if node, ok := this.cache[key]; ok {
        node.val = value
        this.moveToHead(node)
        return
    }
    
    newNode := &Node{key: key, val: value}
    this.cache[key] = newNode
    this.addToHead(newNode)
    
    if len(this.cache) > this.capacity {
        removed := this.removeTail()
        delete(this.cache, removed.key)
    }
}`,
  },
];

// 获取分类列表
export function getCategories() {
  const categories = new Set(codeExamples.map((ex) => ex.category));
  return ["全部", ...Array.from(categories)];
}

// 根据分类筛选示例
export function getExamplesByCategory(category) {
  if (category === "全部") {
    return codeExamples;
  }
  return codeExamples.filter((ex) => ex.category === category);
}
