import random as ran

def sum(a, b):
    return a + b

class CapsCut:
    def __init__(self):
        self.x = ran.randint(1, 10)
        self.y = ran.randint(1, 10)
        print(f"Write the sum value of these numbers: {self.x} and {self.y}")

    def matched(self, user_sum):
        return user_sum == sum(self.x, self.y)


i = 0
while i <= 100:
    go = CapsCut()
    n = int(input("Enter your answer: "))
    if go.matched(n):
        print("Correct Answer!")
        break
    else:
        print("Wrong Answer, Try Again!")
    i += 1


