from food_item import FoodItem

class Restaurant:
    """
    Restaurant class for managing menu items.
    """

    def __init__(self, restaurant_id, name, location, rating=0.0):
        self.__restaurant_id = restaurant_id
        self.__name = name
        self.__location = location
        self.__rating = rating
        self.__menu = []

    # Getters
    def get_restaurant_id(self):
        return self.__restaurant_id

    def get_name(self):
        return self.__name

    def get_location(self):
        return self.__location

    def get_rating(self):
        return self.__rating

    def get_menu(self):
        return self.__menu

    # Setters
    def set_name(self, name):
        self.__name = name

    def set_location(self, location):
        self.__location = location

    def set_rating(self, rating):
        if 0 <= rating <= 5:
            self.__rating = rating
        else:
            raise ValueError("Rating must be between 0 and 5.")

    # Menu Operations
    def add_food(self, food):
        if isinstance(food, FoodItem):
            self.__menu.append(food)
        else:
            raise TypeError("Only FoodItem objects can be added.")

    def remove_food(self, food_id):
        for food in self.__menu:
            if food.get_food_id() == food_id:
                self.__menu.remove(food)
                return True
        return False

    def search_food(self, keyword):
        result = []
        keyword = keyword.lower()
        for food in self.__menu:
            if keyword in food.get_name().lower():
                result.append(food)
        return result

    def display_menu(self):
        if not self.__menu:
            print("\nMenu is empty.")
            return

        print(f"\n===== {self.__name} Menu =====")
        for food in self.__menu:
            print(food)

    def __str__(self):
        return f"{self.__restaurant_id} | {self.__name} | {self.__location} | ⭐ {self.__rating}"


if __name__ == "__main__":
    r = Restaurant(1, "Spice Hub", "Hyderabad", 4.6)

    b = FoodItem(101, "Burger", "Fast Food", 149, 4.5)
    p = FoodItem(102, "Pizza", "Italian", 299, 4.7)
    d = FoodItem(103, "Dosa", "South Indian", 99, 4.8)

    r.add_food(b)
    r.add_food(p)
    r.add_food(d)

    print(r)
    r.display_menu()

    print("\nSearch Results:")
    for item in r.search_food("bur"):
        print(item)

    r.remove_food(102)

    print("\nMenu After Removal:")
    r.display_menu()
