const Payment = require("../models/payment");

exports.createPayment = async (req, res) => {
  try {
    const { customerId, amount } = req.body;
    const payment = await Payment.create({
      customerId,
      amount,
      status: "pending",
    });
    res.json({ msg: "Payment created", payment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error creating payment", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }
    const { status } = req.body;
    payment.status = status;
    await payment.save();

    // Notify clients via WebSocket about payment status update
    const io = req.app.get("socketio");
    io.emit("paymentUpdate", payment);

    res.json({ msg: "Payment updated", payment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error updating payment", error: error.message });
  }
};
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    console.error("Error retrieving payments", error);
    res
      .status(500)
      .json({ msg: "Error retrieving payments", error: error.message });
  }
};
