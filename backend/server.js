const express = require('express');
const cors = require('cors');
const path = require('path');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

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

const parking_fee_without_hours = [
  { id: 1, Fee: "£1" },
  { id: 2, Fee: "£2" },
  { id: 3, Fee: "£3" },
  { id: 4, Fee: "£4" },
  { id: 5, Fee: "£5" },
  { id: 6, Fee: "£6" },
  { id: 7, Fee: "£7" },
  { id: 8, Fee: "£8" },
  { id: 9, Fee: "£9" },
  { id: 10, Fee: "£10" },
];

const days = [
  { id: 1, Days: 1 },
  { id: 2, Days: 2 },
  { id: 3, Days: 3 },
  { id: 4, Days: 4 },
  { id: 5, Days: 5 },
];

app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

// Your existing routes
app.get('/api/days', (req, res) => {
  res.json(days);
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
const sitesContainerId = process.env.COSMOS_DB_SITES_CONTAINER_ID;
const flowsContainerId = process.env.COSMOS_DB_FLOWS_CONTAINER_ID;

const client = new CosmosClient({ endpoint, key });

// Middleware to handle JSON requests
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  console.log(`Login attempt for password: ${password}`);

  try {
    // Ensure email is a string before using it in the query
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid input: email and password must be strings');
    }

    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @Email",
      parameters: [{ name: "@Email", value: email }]
    };

    const { resources: users } = await client.database(databaseId).container(sitesContainerId).items.query(querySpec).fetchAll();

    if (users.length > 0) {
      const user = users[0];
      console.log("User found:", user);

      if (password === user.password) {
        res.json({ message: 'Login successful', user });
      } else {
        console.log('Password does not match');
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error.message); // Log the error message
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/flows/:workflowName', async (req, res) => {
  const workflowName = req.params.workflowName;
  const querySpec = {
    query: "SELECT * from c WHERE c.workflowName = @workflowName",
    parameters: [
      {
        name: "@workflowName",
        value: workflowName
      }
    ]
  };

  try {
    console.log(`Fetching config for workflowName: ${workflowName}`);
    const { resources: items } = await client.database(databaseId).container(flowsContainerId).items.query(querySpec).fetchAll();
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
    const { resources: items } = await client.database(databaseId).container(sitesContainerId).items.query(querySpec).fetchAll();
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

app.get('/api/flows', async (req, res) => {
  try {
    const querySpec = { query: "SELECT * from c" };
    const { resources: flows } = await client.database(databaseId).container(flowsContainerId).items.query(querySpec).fetchAll();
    res.json(flows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sites', async (req, res) => {
  try {
    const querySpec = { query: "SELECT * from c" };
    const { resources: sites } = await client.database(databaseId).container(sitesContainerId).items.query(querySpec).fetchAll();
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flows/:flowId', async (req, res) => {
  const flowId = req.params.flowId;
  const updatedConfig = req.body;

  try {
    const { resource: updatedItem } = await client.database(databaseId).container(flowsContainerId).item(flowId).replace(updatedConfig);
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating flow:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sites', async (req, res) => {
  const { siteName, address, contactNumber, email, password, workflowName } = req.body;
  const newSite = {
    siteId: `site${Date.now()}`,
    siteName,
    address,
    contactNumber,
    email,
    password,
    workflowName
  };

  try {
    const { resource: createdItem } = await client.database(databaseId).container(sitesContainerId).items.create(newSite);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html')); // Adjust this path if necessary
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
