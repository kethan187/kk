from abc import ABC, abstractmethod


class Payment(ABC):
    """
    Abstract Payment Class
    """

    def __init__(self, amount):
        self._amount = amount

    @abstractmethod
    def pay(self):
        pass


class UPI(Payment):

    def __init__(self, amount, upi_id):
        super().__init__(amount)
        self.upi_id = upi_id

    def pay(self):
        print("\n===== UPI PAYMENT =====")
        print(f"UPI ID : {self.upi_id}")
        print(f"Amount : ₹{self._amount:.2f}")
        print("Payment Successful via UPI")


class Card(Payment):

    def __init__(self, amount, card_number, card_holder):
        super().__init__(amount)
        self.card_number = card_number
        self.card_holder = card_holder

    def pay(self):
        print("\n===== CARD PAYMENT =====")
        print(f"Card Holder : {self.card_holder}")
        print(f"Card Number : **** **** **** {self.card_number[-4:]}")
        print(f"Amount      : ₹{self._amount:.2f}")
        print("Payment Successful via Card")


class CashOnDelivery(Payment):

    def __init__(self, amount):
        super().__init__(amount)

    def pay(self):
        print("\n===== CASH ON DELIVERY =====")
        print(f"Amount to Pay : ₹{self._amount:.2f}")
        print("Please pay the delivery partner.")


if __name__ == "__main__":

    upi = UPI(499.00, "rahul@upi")
    upi.pay()

    card = Card(799.00, "1234567812345678", "Rahul")
    card.pay()

    cod = CashOnDelivery(299.00)
    cod.pay()
