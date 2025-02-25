const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, paymentController.createPayment);

router.put("/:id", authMiddleware, paymentController.updatePayment);
router.get("/", authMiddleware, paymentController.getPayments);
module.exports = router;
