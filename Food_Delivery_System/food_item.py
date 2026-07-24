class FoodItem:
    """
    Represents a food item in a restaurant menu.
    Demonstrates:
    - Constructor
    - Encapsulation
    - Getters & Setters
    - __str__()
    """

    def __init__(self, food_id, name, category, price, rating=0.0, available=True):
        self.__food_id = food_id
        self.__name = name
        self.__category = category
        self.__price = price
        self.__rating = rating
        self.__available = available

    # ---------- Getters ----------
    def get_food_id(self):
        return self.__food_id

    def get_name(self):
        return self.__name

    def get_category(self):
        return self.__category

    def get_price(self):
        return self.__price

    def get_rating(self):
        return self.__rating

    def is_available(self):
        return self.__available

    # ---------- Setters ----------
    def set_name(self, name):
        self.__name = name

    def set_category(self, category):
        self.__category = category

    def set_price(self, price):
        if price > 0:
            self.__price = price
        else:
            raise ValueError("Price must be greater than 0.")

    def set_rating(self, rating):
        if 0 <= rating <= 5:
            self.__rating = rating
        else:
            raise ValueError("Rating must be between 0 and 5.")

    def set_availability(self, status):
        self.__available = bool(status)

    # ---------- Utility Methods ----------
    def display(self):
        status = "Available" if self.__available else "Not Available"
        print(f"""
Food ID   : {self.__food_id}
Name      : {self.__name}
Category  : {self.__category}
Price     : ₹{self.__price:.2f}
Rating    : {self.__rating}
Status    : {status}
""")

    def __str__(self):
        status = "Available" if self.__available else "Not Available"
        return (f"{self.__food_id} | {self.__name} | {self.__category} | "
                f"₹{self.__price:.2f} | ⭐ {self.__rating} | {status}")


if __name__ == "__main__":
    burger = FoodItem(101, "Veg Burger", "Fast Food", 149.0, 4.5)

    print("Using display()")
    burger.display()

    print("Using __str__()")
    print(burger)

    burger.set_price(169)
    burger.set_rating(4.8)
    burger.set_availability(False)

    print("\nAfter Update:")
    print(burger)
