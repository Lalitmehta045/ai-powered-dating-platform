import express from 'express';
import listEndpoints from 'express-list-endpoints';
import app from './src/app';

const endpoints = listEndpoints(app);
console.log(JSON.stringify(endpoints, null, 2));
