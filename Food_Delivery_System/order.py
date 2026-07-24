from datetime import datetime

class Order:
    """
    Handles customer orders.
    """

    order_counter = 1000

    def __init__(self, customer, cart):
        Order.order_counter += 1
        self.__order_id = Order.order_counter
        self.__customer = customer
        self.__items = cart.get_items().copy()
        self.__total_amount = cart.calculate_total()
        self.__status = "Pending"
        self.__order_time = datetime.now()

    def get_order_id(self):
        return self.__order_id

    def get_status(self):
        return self.__status

    def get_total(self):
        return self.__total_amount

    def update_status(self, status):
        self.__status = status

    def display_order(self):
        print(f"\n========== ORDER #{self.__order_id} ==========")
        print("Customer :", self.__customer.get_name())
        print("Time     :", self.__order_time.strftime("%d-%m-%Y %H:%M:%S"))
        print("-" * 50)
        print(f"{'Food':20} {'Qty':>5} {'Subtotal':>12}")

        for item, qty in self.__items.items():
            subtotal = item.get_price() * qty
            print(f"{item.get_name():20} {qty:>5} ₹{subtotal:>10.2f}")

        print("-" * 50)
        print(f"Total Amount : ₹{self.__total_amount:.2f}")
        print(f"Status       : {self.__status}")

    def cancel_order(self):
        if self.__status == "Delivered":
            print("Delivered orders cannot be cancelled.")
        else:
            self.__status = "Cancelled"
            print("Order cancelled successfully.")

    def confirm_order(self):
        self.__status = "Confirmed"

    def dispatch_order(self):
        self.__status = "Out for Delivery"

    def deliver_order(self):
        self.__status = "Delivered"

    def __str__(self):
        return (f"Order ID: {self.__order_id} | "
                f"Customer: {self.__customer.get_name()} | "
                f"Total: ₹{self.__total_amount:.2f} | "
                f"Status: {self.__status}")


if __name__ == "__main__":
    from user import Customer
    from food_item import FoodItem
    from cart import Cart

    customer = Customer(
        1,
        "Rahul",
        "9876543210",
        "rahul@gmail.com",
        "1234",
        "Hyderabad"
    )

    burger = FoodItem(101, "Burger", "Fast Food", 150, 4.5)
    pizza = FoodItem(102, "Pizza", "Italian", 300, 4.8)

    cart = Cart()
    cart.add_item(burger, 2)
    cart.add_item(pizza, 1)

    order = Order(customer, cart)

    order.display_order()

    order.confirm_order()
    print(order)

    order.dispatch_order()
    print(order)

    order.deliver_order()
    print(order)
