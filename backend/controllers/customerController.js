const { validationResult } = require("express-validator");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const customerModel = require("../models/customer");

// Multer setup for Excel uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.EXCEL_UPLOAD_DIR || "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `upload-${Date.now()}-${file.originalname}`);
  },
});
exports.uploadMiddleware = multer({ storage }).single("file");

// Create single customer
exports.createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const customerData = {
    name: req.body.name,
    contact: req.body.contact,
    outstandingAmount: req.body.outstandingAmount || 0,
    paymentDueDate: req.body.paymentDueDate,
    paymentStatus: req.body.paymentStatus || "pending",
  };

  try {
    const customer = await customerModel.addCustomer(customerData);
    // Emit notification via WebSocket
    const io = req.app.get("socketio");
    io.emit("notification", { type: "New customer added", data: customer });
    res.json({ msg: "Customer created successfully", customer });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error creating customer", error: error.message });
  }
};

// Retrieve all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.getCustomers();
    res.json(customers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error retrieving customers", error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  const customerId = req.params.id;
  const updateData = req.body;
  try {
    const updatedCustomer = await customerModel.updateCustomer(
      customerId,
      updateData
    );
    res.json({
      msg: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error updating customer", error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  const customerId = req.params.id;
  try {
    await customerModel.deleteCustomer(customerId);
    res.json({ msg: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error deleting customer", error: error.message });
  }
};

// Bulk upload customers via Excel
exports.bulkUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0;
    let errors = [];
    const io = req.app.get("socketio");

    // Inside your bulkUpload function, update the for-loop:
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      if (row.name && row.contact && row.paymentDueDate) {
        // Convert Excel date if paymentDueDate is numeric
        let paymentDueDate = row.paymentDueDate;
        if (typeof paymentDueDate === "number") {
          paymentDueDate = new Date(
            Math.round((paymentDueDate - 25569) * 86400 * 1000)
          ).toISOString();
        }
        let customerData = {
          name: row.name,
          contact: row.contact,
          outstandingAmount: row.outstandingAmount || 0,
          paymentDueDate: paymentDueDate,
          paymentStatus: row.paymentStatus || "pending",
        };
        try {
          const customer = await customerModel.addCustomer(customerData);
          successCount++;
          io.emit("notification", {
            type: "New customer added",
            data: customer,
          });
        } catch (error) {
          errors.push(`Row ${index + 2}: ${error.message}`);
        }
      } else {
        errors.push(`Row ${index + 2}: Missing required fields`);
      }
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ msg: "Bulk upload complete", successCount, errors });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Failed to process file", error: error.message });
  }
};
