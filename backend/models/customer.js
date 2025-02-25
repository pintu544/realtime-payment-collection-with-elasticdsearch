const { Client } = require("@elastic/elasticsearch");

// Update the node URL with the appropriate username and password.
// For example: "https://elastic:your_password_here@localhost:9200"
const client = new Client({
  node: "https://elastic:TuOU2EwI702X1ZJSm113@localhost:9200",
  tls: {
    rejectUnauthorized: false, // Disable certificate verification for self-signed certificates
  },
});
//set ELASTIC_PASSWORD=TuOU2EwI702X1ZJSm113
//docker cp es01:/usr/share/elasticsearch/config/certs/http_ca.crt .
const indexName = "customers";

async function createIndex() {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists.body) {
    await client.indices.create({ index: indexName });
    console.log(`Created index ${indexName}`);
  } else {
    console.log(`Index ${indexName} already exists.`);
  }
}

// Create index at startup
createIndex().catch((error) => {
  console.error("Error creating index:", error);
});

async function addCustomer(customer) {
  const response = await client.index({
    index: indexName,
    body: customer,
  });
  await client.indices.refresh({ index: indexName });
  const id = response.body ? response.body._id : response._id;
  return { id, ...customer };
}

async function updateCustomer(id, customer) {
  await client.update({
    index: indexName,
    id: id,
    body: { doc: customer },
  });
  await client.indices.refresh({ index: indexName });
  return { id, ...customer };
}

async function deleteCustomer(id) {
  await client.delete({
    index: indexName,
    id: id,
  });
  await client.indices.refresh({ index: indexName });
  return { id };
}

async function getCustomers() {
  const response = await client.search({
    index: indexName,
    body: { query: { match_all: {} } },
  });
  const hits = response.body ? response.body.hits.hits : response.hits.hits;
  return hits.map((hit) => ({
    id: hit._id,
    ...hit._source,
  }));
}

module.exports = {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomers,
};
