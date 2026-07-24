from data import restaurants, customers, delivery_partners
from cart import Cart
from order import Order
from payment import UPI, Card, CashOnDelivery

current_user = None
cart = Cart()
orders = []


def login():
    email = input("Email: ")
    password = input("Password: ")

    for user in customers:
        if user.login(email, password):
            return user

    print("Login Failed")
    return None


def show_restaurants():
    print("\nRestaurants")
    for i, r in enumerate(restaurants, start=1):
        print(f"{i}. {r}")


def add_to_cart():
    show_restaurants()
    r_index = int(input("Select Restaurant: ")) - 1
    restaurant = restaurants[r_index]

    restaurant.display_menu()

    food_id = int(input("Enter Food ID: "))
    qty = int(input("Quantity: "))

    for item in restaurant.get_menu():
        if item.get_food_id() == food_id:
            cart.add_item(item, qty)
            return

    print("Food not found.")


def checkout(user):
    if cart.is_empty():
        print("Cart is empty.")
        return

    cart.display_cart()
    order = Order(user, cart)
    orders.append(order)

    print("\nPayment")
    print("1.UPI")
    print("2.Card")
    print("3.Cash On Delivery")

    choice = input("Choice: ")

    if choice == "1":
        upi = input("UPI ID: ")
        payment = UPI(order.get_total(), upi)
    elif choice == "2":
        number = input("Card Number: ")
        holder = input("Card Holder: ")
        payment = Card(order.get_total(), number, holder)
    else:
        payment = CashOnDelivery(order.get_total())

    payment.pay()
    order.confirm_order()

    if delivery_partners:
        partner = delivery_partners[0]
        partner.accept_order(order)
        partner.complete_order()

    user.add_order(order)
    cart.clear_cart()
    print("Order Placed Successfully.")


def view_orders(user):
    user.display_orders()


while True:

    print("""
========== FOOD DELIVERY ==========
1. Login
2. View Restaurants
3. Add Item to Cart
4. View Cart
5. Checkout
6. Order History
7. Exit
==================================
""")

    choice = input("Enter Choice: ")

    if choice == "1":
        current_user = login()

    elif choice == "2":
        show_restaurants()

    elif choice == "3":
        if current_user:
            add_to_cart()
        else:
            print("Please login first.")

    elif choice == "4":
        cart.display_cart()

    elif choice == "5":
        if current_user:
            checkout(current_user)
        else:
            print("Please login first.")

    elif choice == "6":
        if current_user:
            view_orders(current_user)
        else:
            print("Please login first.")

    elif choice == "7":
        print("Thank You!")
        break

    else:
        print("Invalid Choice")
