// A: Iterative
// Time: O(n), Space: O(1)
function sum_to_n_a(n) {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
}

// B: Mathematical Formula
// Time: O(1), Space: O(1)
function sum_to_n_b(n) {
    if (n <= 0) return 0;

    return n % 2 === 0
        ? (n / 2) * (n + 1)
        : n * ((n + 1) / 2);
}

// C: Recursive + Memoization
// First call: O(n) time, O(n) space
// Cached call: O(1) average time
const memo = new Map();
function sum_to_n_c(n) {
    if (n <= 0) return 0;

    if (memo.has(n)) {
        return memo.get(n);
    }

    const result = n + sum_to_n_c(n - 1);
    memo.set(n, result);

    return result;
}


console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));

