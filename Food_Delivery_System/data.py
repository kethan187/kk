"""
data.py
Loads sample data for the Food Delivery System.
"""

from food_item import FoodItem
from restaurant import Restaurant
from user import Customer, RestaurantOwner
from delivery_partner import DeliveryPartner

# -------------------------
# Food Items
# -------------------------
burger = FoodItem(101, "Veg Burger", "Fast Food", 149, 4.5)
pizza = FoodItem(102, "Margherita Pizza", "Italian", 299, 4.7)
dosa = FoodItem(103, "Masala Dosa", "South Indian", 99, 4.8)
biryani = FoodItem(104, "Chicken Biryani", "Main Course", 249, 4.9)
icecream = FoodItem(105, "Chocolate Ice Cream", "Dessert", 129, 4.6)

# -------------------------
# Restaurants
# -------------------------
spice_hub = Restaurant(1, "Spice Hub", "Hyderabad", 4.6)
pizza_world = Restaurant(2, "Pizza World", "Hyderabad", 4.5)

spice_hub.add_food(burger)
spice_hub.add_food(dosa)
spice_hub.add_food(biryani)

pizza_world.add_food(pizza)
pizza_world.add_food(icecream)

restaurants = [spice_hub, pizza_world]

# -------------------------
# Customers
# -------------------------
customer1 = Customer(
    1,
    "Rahul",
    "9876543210",
    "rahul@gmail.com",
    "1234",
    "Hyderabad"
)

customer2 = Customer(
    2,
    "Priya",
    "9876500000",
    "priya@gmail.com",
    "1234",
    "Secunderabad"
)

customers = [customer1, customer2]

# -------------------------
# Restaurant Owners
# -------------------------
owner1 = RestaurantOwner(
    101,
    "Kiran",
    "9000000001",
    "owner1@gmail.com",
    "1234",
    "Spice Hub"
)

owner2 = RestaurantOwner(
    102,
    "Ramesh",
    "9000000002",
    "owner2@gmail.com",
    "1234",
    "Pizza World"
)

owners = [owner1, owner2]

# -------------------------
# Delivery Partners
# -------------------------
partner1 = DeliveryPartner(
    201,
    "Ajay",
    "9888888888",
    "ajay@gmail.com",
    "1234",
    "Bike"
)

partner2 = DeliveryPartner(
    202,
    "Vijay",
    "9777777777",
    "vijay@gmail.com",
    "1234",
    "Scooter"
)

delivery_partners = [partner1, partner2]


if __name__ == "__main__":
    print("Restaurants")
    for r in restaurants:
        print(r)

    print("\nCustomers")
    for c in customers:
        print(c.get_name())

    print("\nDelivery Partners")
    for p in delivery_partners:
        print(p.get_name())
