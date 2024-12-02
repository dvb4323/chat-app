const swaggerAutogen = require("swagger-autogen")();
const doc = {
  info: {
    title: "Chat App API",
    description: "API Documentation",
    version: "0.1.0",
  },
  host: "api.minim.lol",
};

const outputFile = "./swagger_output.json";
const endpointsFiles = [
  "./src/app.ts"
];

swaggerAutogen(outputFile, endpointsFiles, doc);
