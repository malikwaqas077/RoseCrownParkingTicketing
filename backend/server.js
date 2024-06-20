const express = require('express');
const cors = require('cors');
const path = require('path');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../dist'))); // Update this line if your build directory is different

// Your existing routes
app.get('/api/days', (req, res) => {
  res.json(data);
});

app.get('/api/parking-fee', (req, res) => {
  res.json(parking_fee);
});

app.get('/api/parking-fee-without-hours', (req, res) => {
  res.json(parking_fee_without_hours);
});

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;

const client = new CosmosClient({ endpoint, key });

// Route to get configuration by siteId
app.get('/api/config/:siteId', async (req, res) => {
  const siteId = req.params.siteId;
  const querySpec = {
    query: "SELECT * from c WHERE c.siteId = @siteId",
    parameters: [
      {
        name: "@siteId",
        value: siteId
      }
    ]
  };

  try {
    console.log(`Fetching config for siteId: ${siteId}`);
    const { resources: items } = await client.database(databaseId).container(containerId).items.query(querySpec).fetchAll();
    if (items.length > 0) {
      console.log(`Config found: ${JSON.stringify(items[0])}`);
      res.json(items[0]);
    } else {
      console.log('Config not found');
      res.status(404).json({ error: "Configuration not found" });
    }
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the frontend build files for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html')); // Update this line if your build directory is different
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
