const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

// Endpoint to create a new referral
app.post("/api/referrals", async (req, res) => {
  const { referrerName, referrerEmail, friendName, friendEmail } = req.body;

  // Validate input
  if (!referrerName || !referrerEmail || !friendName || !friendEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate emails
  if (!validateEmail(referrerEmail) || !validateEmail(friendEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Save referral data to the database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        friendName,
        friendEmail,
      },
    });

    const mailOptions = {
      from: referrerEmail,
      to: friendEmail,
      subject: "You have been referred!",
      text: `Hi ${friendName},\n\n${referrerName} has referred you to our course. Check it out!\n\nBest regards,\nAccredian`,
    };

    const transporter = nodemailer.createTransport({
      // For production
      host: "smtp.gmail.email",
      service: "gmail",
      auth: {
        user: "hamzasepal@gmail.com",
        pass: "vbzc mdgs txcx vxxd",
      },
      secure: false,
      tls: { rejectUnauthorized: false },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).send({ success: false, data: error });
        console.log(error);
      } else {
        res.status(200).send({ success: true, data: info });
        console.log("done");
      }
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
