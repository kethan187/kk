"""
Custom exceptions for Food Delivery System
"""

class FoodDeliveryError(Exception):
    """Base exception for the application."""
    pass


class InvalidUserError(FoodDeliveryError):
    def __init__(self, message="Invalid email or password."):
        super().__init__(message)


class FoodNotAvailableError(FoodDeliveryError):
    def __init__(self, food_name):
        super().__init__(f"{food_name} is currently not available.")


class EmptyCartError(FoodDeliveryError):
    def __init__(self):
        super().__init__("Your cart is empty. Please add items before placing an order.")


class PaymentFailedError(FoodDeliveryError):
    def __init__(self, message="Payment failed. Please try again."):
        super().__init__(message)


class OrderNotFoundError(FoodDeliveryError):
    def __init__(self, order_id):
        super().__init__(f"Order with ID {order_id} was not found.")


class RestaurantNotFoundError(FoodDeliveryError):
    def __init__(self, restaurant_name):
        super().__init__(f"Restaurant '{restaurant_name}' was not found.")


if __name__ == "__main__":
    exceptions = [
        InvalidUserError(),
        FoodNotAvailableError("Veg Burger"),
        EmptyCartError(),
        PaymentFailedError(),
        OrderNotFoundError(1001),
        RestaurantNotFoundError("Spice Hub")
    ]

    for error in exceptions:
        try:
            raise error
        except FoodDeliveryError as e:
            print(type(e).__name__, ":", e)
