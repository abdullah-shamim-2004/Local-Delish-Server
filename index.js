require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //Create database collection
    const db = client.db("Local-Delish-DB");
    const reviewCollection = db.collection("reviews");

    //create a review
    app.post("/reviews", async (req, res) => {
      try {
        const review = await reviewCollection.insertOne(req.body);
        res.status(201).json(review);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    //Find or Get all review
    app.get("/reviews", async (req, res) => {
      try {
        const { limit, sort, search, email } = req.query;
        let query = {};
        if (email) {
          query = { userEmail: email };
        }
        const result = await reviewCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Get a single review
    app.get("/reviews/:id", async (req, res) => {
      const reviewId = req.params.id;

      try {
        const review = await reviewCollection.findOne({
          _id: new ObjectId(reviewId),
        });

        if (!review) {
          return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json({
          success: true,
          review,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    });
    // Delete my review
    app.delete("/reviews/:id", async (req, res) => {
      try {
        const result = await reviewCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Review not found" });
        }
        res
          .status(200)
          .json({ success: true, message: "Review deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Local Delish Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
