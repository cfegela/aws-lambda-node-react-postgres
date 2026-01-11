import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function initializeDb() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

async function getItems() {
  const result = await getPool().query('SELECT * FROM items ORDER BY id');
  return response(200, result.rows);
}

async function getItem(id) {
  const result = await getPool().query('SELECT * FROM items WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return response(404, { error: 'Item not found' });
  }
  return response(200, result.rows[0]);
}

async function createItem(body) {
  const { name, description } = JSON.parse(body);
  if (!name) {
    return response(400, { error: 'Name is required' });
  }
  const result = await getPool().query(
    'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  return response(201, result.rows[0]);
}

async function updateItem(id, body) {
  const { name, description } = JSON.parse(body);
  const result = await getPool().query(
    `UPDATE items
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [name, description, id]
  );
  if (result.rows.length === 0) {
    return response(404, { error: 'Item not found' });
  }
  return response(200, result.rows[0]);
}

async function deleteItem(id) {
  const result = await getPool().query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    return response(404, { error: 'Item not found' });
  }
  return response(200, { message: 'Item deleted' });
}

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    await initializeDb();

    const { httpMethod, pathParameters, body } = event;
    const id = pathParameters?.id;

    switch (httpMethod) {
      case 'GET':
        return id ? await getItem(id) : await getItems();
      case 'POST':
        return await createItem(body);
      case 'PUT':
        if (!id) return response(400, { error: 'ID required' });
        return await updateItem(id, body);
      case 'DELETE':
        if (!id) return response(400, { error: 'ID required' });
        return await deleteItem(id);
      default:
        return response(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error' });
  }
};
