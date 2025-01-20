const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { Types } = require("mongoose");
const ObjectId = Types.ObjectId;

const Product = require("./model/product");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

app.use(cors());

app.use(express.json());
///// addd new vedio chest like that in data base

app.post("/update-fitnes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Product ID from URL
    const newItem = req.body; // New fitness item from the request body

    if (!Array.isArray(newItem) || newItem.length !== 3) {
      return res.status(400).json({
        error: "Invalid item format. Must be an array with 3 elements.",
      });
    }

    const result = await Product.updateOne(
      { _id: id },
      { $push: { fitnes: newItem } } // Push the new item to the fitness array
    );

    res.status(200).json({ message: "Video added successfully.", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//// update the vedios chest on mongo

app.patch("/pro/:id", async (req, res) => {
  const { id } = req.params; // Extract the id of the video to update
  const { title, description } = req.body;
  console.log(title);
  // Get updated title and description

  try {
    const result = await Product.updateOne(
      { "fitnes.id": id }, // Find the document containing the video
      {
        $set: {
          "fitnes.$.title": title,
          "fitnes.$.description": description,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Video updated successfully" });
    } else {
      res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating video", error });
  }
});
////// updathe the title and discription after the problem
app.put("/update-video", async (req, res) => {
  const { id, videoId, newTitle, newDescription } = req.body;

  if (!id || !videoId || !newTitle || !newDescription) {
    return res.status(400).send({
      error: "id, videoId, newTitle, and newDescription are required",
    });
  }

  try {
    const result = await Product.updateOne(
      { _id: new ObjectId(id) }, // Match the document by ID
      {
        $set: {
          "fitnes.$[video].1": newTitle, // Update title
          "fitnes.$[video].2": newDescription, // Update description
        },
      },
      {
        arrayFilters: [
          { "video.0": videoId }, // Match specific videoId in the array
        ],
      }
    );

    if (result.modifiedCount > 0) {
      res.send({ message: "Video updated successfully" });
    } else {
      res.status(404).send({ error: "Video not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).send({ error: "Failed to update video" });
  }
});

//// delet and vedio from database
app.delete("/delete-video/:id", async (req, res) => {
  const { id } = req.params; // Video ID from the URL
  const { productId } = req.body; // Product ID from the request body

  try {
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    const result = await Product.updateOne(
      { _id: productId }, // Use the product ID from the body
      [
        {
          $set: {
            fitnes: {
              $filter: {
                input: "$fitnes",
                as: "item",
                cond: { $ne: [{ $arrayElemAt: ["$$item", 0] }, id] }, // Exclude the sub-array where the first element matches the video ID
              },
            },
          },
        },
      ]
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Video deleted successfully." });
    } else {
      res.status(404).json({ message: "Video not found." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the video." });
  }
});

///////////          for email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "s12011015@stu.najah.edu", // Your Gmail account
    pass: "snrb bxxq soft kcyb", // Gmail app password
  },
});
app.post("/send-email", (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: "your-email@gmail.com",
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
});

///////////////////////
app.get("/", (req, res) => {
  res.send("hello abood love u");
});

///// for update the data base
app.put("/profile/:id", async (req, res) => {
  try {
    console.log("updtade");
    const { id } = req.params; // Extract the user ID or email from the URL parameters
    const updateData = req.body; // Extract the updated profile details from the request body

    // Use findOneAndUpdate to locate the user by email and update their profile
    const updatedProfile = await Product.findOneAndUpdate(
      { email: id }, // Match the user by email
      { $set: updateData }, // Update the provided fields
      { new: true } // Return the updated document
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" }); // Handle case if user is not found
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return the error message
  }
});
////// delet item vedios
app.delete("/pro/delete/:userId/:videoId", async (req, res) => {
  const { userId, videoId } = req.params;

  try {
    const user = await Product.findOneAndUpdate(
      { email: userId },
      { $pull: { vedios: videoId } },
      { new: true }
    );

    if (user) {
      res.status(200).json({ message: "Video deleted successfully.", user });
    } else {
      res
        .status(404)
        .json({ message: "User not found or video not associated." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

////// sign up
app.post("/users", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // Product;

    res.status(200).json(product);
    console.log(error.massage);
  } catch (eroor) {}
});
///////////////////////////  chore api
const axios = require("axios");
const API_KEY = "Ygwlx1JIu2ps1ZVrdS5DbJ8nPCUwopyWDk0tmuWB"; // Replace with your actual Cohere API key
const endpoint = "https://api.cohere.ai/generate";

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  const requestBody = {
    model: "command-light",
    prompt,
    max_tokens: 400,
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    res.json({ text: response.data.text });
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: error.message });
  }
});

/////////// udtade the admin role for user
app.put("/pro_users/update_role/:email", async (req, res) => {
  const { email } = req.params;
  const { role } = req.body;

  try {
    const user = await Product.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (user) {
      res.status(200).json({ message: "Role updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating role", error: err });
  }
});
/////////// udtade the token for alll
app.put("/pro_users/token/:email", async (req, res) => {
  const { email } = req.params;
  const { token } = req.body;

  try {
    const user = await Product.findOneAndUpdate(
      { email },
      { token },
      { new: true }
    );

    if (user) {
      res.status(200).json({ message: "Role updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating role", error: err });
  }
});
// const requestBody = {
//   model: "command", // Correct model for text generation
//   prompt: "i am a abood  iam doctor I want stretching exercises. Give me some", // Example text prompt
//   max_tokens: 100, // Maximum number of tokens to generate
// };

// async function generateText() {
//   try {
//     const response = await axios.post(endpoint, requestBody, {
//       headers: {
//         Authorization: `Bearer ${API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     // Print the generated text
//     console.log("Generated Text:", response.data.text);
//   } catch (error) {
//     // Log the error with detailed response
//     console.error(
//       "Error generating text:",
//       error.response ? error.response.data : error.message
//     );
//   }
// }

// // Call the function
// generateText();

/////////////////////
//////// for raed llama

app.get("/raed", async (req, res) => {
  console.log("raed");
  const headers = {
    Content_Type: "application/json",

    Authorization:
      "Bearer LA-f1cd4082b99d404d9e52b7626847be4e51b35fc03a91467f8c2614eda279a284",
    "Access-Control-Allow-Orgin": "*",
  };
  const response = await fetch("https://api.llama-api.com/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages: [{ role: "user", content: "is doctor read gay?" }],
    }),
  });
  const data = await response.json();
  //console.log(data);
  res.send(data);
});
////// for store add to my list vedios
app.post("/pro/:id/add-video", async (req, res) => {
  const userId = req.params.id; // User's email or ID
  const videoId = req.body.videoId; // Video's ID
  const day = req.body.day; // Selected day

  try {
    // Find the user by email (or another unique identifier)
    const user = await Product.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

     // Add the video ID to the vedios array if not already present
     if (!user[day].includes(videoId)) {
      console.log()
      user[day].push(videoId);
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Video added successfully! abood", vedios: user[day] });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating vedios", error: err.message });
  }
});


/////////////////////

app.post("/pro", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // Product;

    res.status(200).json(product);
    console.log(error.massage);
  } catch (eroor) {}
  // console.log(req.body);
  // res.send(req.body);
});
app.put("/pro/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body);
  if (!product) {
    res.status(500).json({ massage: "massage.eroor" });
  }
  res.status(500).json(product);
});
//// sign in page
app.get("/pro/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ email: id });

    res.status(200).json(product);
  } catch (eroor) {
    res.status(500).json({ massage: massage.eroor });
  }
  // console.log(req.body);
  // res.send(req.body);
});
//// desplay user admin
app.get("/pro_users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.find({ role: id });

    res.status(200).json(product);
  } catch (eroor) {
    res.status(500).json({ massage: massage.eroor });
  }
  // console.log(req.body);
  // res.send(req.body);
});
//// delete user or coutcj=h admin
app.delete("/pro_users/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the id from the URL parameters

    // Assuming you are deleting based on email, use a query that matches your database schema
    const deletedProduct = await Product.findOneAndDelete({ email: id });

    if (!deletedProduct) {
      return res.status(404).json({ message: "User not found" }); // Return 404 if user doesn't exist
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedProduct });
  } catch (error) {
    console.error("Error deleting user:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
mongoose
  .connect(
    "mongodb+srv://ezzmasre:ezzmasre10@cluster0.jyhqr.mongodb.net/ezz?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("conected to mogo");
    app.listen(3000, () => {
      // console.log("fuker");
    });
  })
  .catch(() => {
    console.log("eroor");
  });
