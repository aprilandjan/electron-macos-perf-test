function fibonacci(n) {
    return n < 1 ? 0
         : n <= 2 ? 1
         : fibonacci(n - 1) + fibonacci(n - 2)
 }

 module.exports = async () => {
    const t = Date.now();
    fibonacci(40);
    return Date.now() - t;
 };