from user import User
from order import Order

class DeliveryPartner(User):
    """
    Delivery partner responsible for delivering customer orders.
    Demonstrates inheritance, super(), encapsulation and method overriding.
    """

    def __init__(self, user_id, name, phone, email, password, vehicle):
        super().__init__(user_id, name, phone, email, password)
        self.__vehicle = vehicle
        self.__available = True
        self.__current_order = None

    def is_available(self):
        return self.__available

    def get_vehicle(self):
        return self.__vehicle

    def accept_order(self, order):
        if not isinstance(order, Order):
            raise TypeError("Expected an Order object.")

        if not self.__available:
            print("Partner is already delivering an order.")
            return

        self.__current_order = order
        self.__available = False
        order.dispatch_order()
        print(f"Order #{order.get_order_id()} accepted.")

    def complete_order(self):
        if self.__current_order is None:
            print("No active order.")
            return

        self.__current_order.deliver_order()
        print(f"Order #{self.__current_order.get_order_id()} delivered successfully.")

        self.__current_order = None
        self.__available = True

    def display_profile(self):
        print("\n===== DELIVERY PARTNER =====")
        print("ID       :", self.get_user_id())
        print("Name     :", self.get_name())
        print("Phone    :", self.get_phone())
        print("Email    :", self.get_email())
        print("Vehicle  :", self.__vehicle)
        print("Available:", self.__available)
        if self.__current_order:
            print("Current Order:", self.__current_order.get_order_id())
        else:
            print("Current Order: None")
        print("============================")


if __name__ == "__main__":
    partner = DeliveryPartner(
        301,
        "Ajay",
        "9876543210",
        "ajay@gmail.com",
        "1234",
        "Bike"
    )

    partner.display_profile()
