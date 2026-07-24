class Cart:
    """
    Shopping Cart for Food Delivery System.
    Stores FoodItem objects with quantities.
    """

    def __init__(self):
        self.__items = {}

    def add_item(self, food_item, quantity=1):
        if not food_item.is_available():
            print(f"{food_item.get_name()} is not available.")
            return

        if food_item in self.__items:
            self.__items[food_item] += quantity
        else:
            self.__items[food_item] = quantity

        print(f"{quantity} x {food_item.get_name()} added to cart.")

    def remove_item(self, food_item):
        if food_item in self.__items:
            del self.__items[food_item]
            print(f"{food_item.get_name()} removed from cart.")
        else:
            print("Item not found in cart.")

    def update_quantity(self, food_item, quantity):
        if food_item not in self.__items:
            print("Item not found in cart.")
            return

        if quantity <= 0:
            self.remove_item(food_item)
        else:
            self.__items[food_item] = quantity
            print("Quantity updated.")

    def calculate_total(self):
        total = 0
        for item, qty in self.__items.items():
            total += item.get_price() * qty
        return total

    def is_empty(self):
        return len(self.__items) == 0

    def clear_cart(self):
        self.__items.clear()
        print("Cart cleared.")

    def get_items(self):
        return self.__items

    def display_cart(self):
        if self.is_empty():
            print("\nCart is empty.")
            return

        print("\n=========== CART ===========")
        print(f"{'Food':20} {'Qty':>5} {'Price':>10} {'Subtotal':>12}")

        for item, qty in self.__items.items():
            subtotal = item.get_price() * qty
            print(f"{item.get_name():20} {qty:>5} ₹{item.get_price():>8.2f} ₹{subtotal:>10.2f}")

        print("-" * 50)
        print(f"Grand Total : ₹{self.calculate_total():.2f}")

if __name__ == "__main__":
    from food_item import FoodItem

    burger = FoodItem(101, "Burger", "Fast Food", 150, 4.5)
    pizza = FoodItem(102, "Pizza", "Italian", 300, 4.7)

    cart = Cart()

    cart.add_item(burger, 2)
    cart.add_item(pizza, 1)

    cart.display_cart()

    cart.update_quantity(burger, 3)

    cart.display_cart()

    cart.remove_item(pizza)

    cart.display_cart()
