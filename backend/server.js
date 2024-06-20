const express = require('express');
const cors = require('cors');
const path = require('path');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../dist'))); // Adjust this path if your frontend build directory is different

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;
const containerId = process.env.COSMOS_DB_CONTAINER_ID;

const client = new CosmosClient({ endpoint, key });

// Middleware to handle JSON requests
app.use(express.json());

// Example data
const data = [
  { id: 1, Days: 1 },
  { id: 2, Days: 2 },
  { id: 3, Days: 3 },
  { id: 4, Days: 4 },
  { id: 5, Days: 5 },
  { id: 6, Days: 6 },
  { id: 7, Days: 7 },
  { id: 8, Days: 8 },
  { id: 9, Days: 9 },
  { id: 10, Days: 10 },
];

const parking_fee = [
  { id: 1, Fee: "UP TO 1 HR - £1" },
  { id: 2, Fee: "UP TO 2 HR - £2" },
  { id: 3, Fee: "UP TO 3 HR - £3" },
  { id: 4, Fee: "UP TO 4 HR - £4" },
  { id: 5, Fee: "UP TO 5 HR - £5" },
  { id: 6, Fee: "UP TO 5 HR - £6" },
  { id: 7, Fee: "UP TO 5 HR - £7" },
  { id: 8, Fee: "UP TO 5 HR - £8" },
  { id: 9, Fee: "UP TO 5 HR - £9" },
  { id: 10, Fee: "UP TO 5 HR - £10" },
];

const parking_fee_without_hours = parking_fee.map(item => {
  const feeValue = parseFloat(item.Fee.split(' - ')[1].slice(1)).toFixed(2);
  return { id: item.id, Fee: `£${feeValue}` };
});

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
  res.sendFile(path.join(__dirname, '../dist', 'index.html')); // Adjust this path if necessary
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
