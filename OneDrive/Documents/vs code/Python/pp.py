def fact(n):
    ans = 1
    for i in range(1, n + 1):
        ans *= i
    return ans

def check(n, d):
    res = [1]
    if n >= 3 or d % 3 == 0:
        res.append(3)
    if d == 5:
        res.append(5)
    if n >= 3 or (n == 2 and d == 7):
        res.append(7)
    if n > 5:
        res.append(9)
    else:
        cal = fact(n)
        if (cal * d) % 9 == 0:
            res.append(9)
    return res

def main():
    t = int(input())
    inputs = []
    
    # Take all inputs first
    for _ in range(t):
        n, d = map(int, input().split())
        inputs.append((n, d))
    
    # Now, process and print the output
    for n, d in inputs:
        res = check(n, d)
        print(*res)

if __name__ == "__main__":
    main()
