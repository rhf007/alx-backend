#!/usr/bin/env node

import { createClient, print } from 'redis';

const client = createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (error) => {
  console.error(`Redis client not connected to the server: ${error}`);
});

const createHash = () => {
  const hashKey = 'HolbertonSchools';
  client.hset(hashKey, 'Portland', 50, print);
  client.hset(hashKey, 'Seattle', 80, print);
  client.hset(hashKey, 'New York', 20, print);
  client.hset(hashKey, 'Bogota', 20, print);
  client.hset(hashKey, 'Cali', 40, print);
  client.hset(hashKey, 'Paris', 2, print);
};

const displayHash = () => {
  const hashKey = 'HolbertonSchools';
  client.hgetall(hashKey, (error, object) => {
    if (error) console.error(error);
    console.log(object);
  });
};

createHash();
displayHash();
