const express = require("express");
const bodyParser = require("body-parser");
const pdf = require("pdfkit");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve static files in the project directory
app.use(express.static(__dirname));

// Serve the HTML file when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generate-certificate", (req, res) => {
  const { name, registerNumber, branch, email } = req.body;
  const date = "15th August 2024";

  if (!name || !registerNumber || !branch || !email) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const PDFDocument = require("pdfkit");
    const fs = require("fs");
    const path = require("path");
    const sizeOf = require("image-size"); // To get image dimensions
    const imagePath = path.join(__dirname, "background.png");

    // Create output file path
    const fileName = `certificate-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "certificates", fileName);

    const dimensions = sizeOf(imagePath);
    const imageWidth = dimensions.width;
    const imageHeight = dimensions.height;
    const doc = new PDFDocument({
      size: [imageWidth, imageHeight], // Set page size to image dimensions
    });
    // Set up the PDF document stream
    doc.pipe(fs.createWriteStream(filePath));

    // Use the image as the background
    doc.image(imagePath, 0, 0, { width: imageWidth, height: imageHeight });

    doc.font("Helvetica-Bold").fontSize(80).fillColor("#000000").moveDown(7);
    doc
      .font("Helvetica-Bold")
      .fontSize(80)
      .fillColor("#000000")
      .text(name, { align: "center" })
      .moveDown(0.5);

    doc.font("Helvetica").fontSize(40);
    const registerNumberx = 710 - doc.widthOfString(registerNumber) / 2;
    doc.text(registerNumber, registerNumberx, 875);

    doc.font("Helvetica").fontSize(40);
    const branchx = 1500 - doc.widthOfString(branch) / 2;
    doc.text(branch, branchx, 875);
    doc.end();

    // Send the certificate via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "buntykrgdg2@gmail.com",
        pass: "iiia almd ndde yleg", // Replace with your Gmail app password
      },
    });

    const mailOptions = {
      from: "buntykrgdg2@gmail.com",
      to: email,
      subject: "Independence Day Certificate",
      text: `Hi ${name},\n\nAttached is your certificate.Happy Independence Day\n\nBest regards`,
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .send("Failed to send the certificate via email.");
      }
      res.status(200).send("Certificate sent!");
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("An internal server error occurred.");
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
