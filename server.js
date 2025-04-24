/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});



// Setup our static files
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
* Our home page route
*
* Returns src/pages/index.hbs with data built into it
*/
fastify.get("/", function(request, reply) {
  
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  
  // We need to load our color data file, pick one at random, and add it to the params
  const colors = require("./src/colors.json");
  const allColors = Object.keys(colors);
  let currentColor = allColors[(allColors.length * Math.random()) << 0];

  // Add the color properties to the params object
  params = {
    color: colors[currentColor],
    colorError: null,
    seo: seo
  };
  
  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view("/src/pages/index.hbs", params);
});

/**
* Our POST route to handle and react to form submissions 
*
* Accepts body data indicating the user choice
*/
fastify.post("/", function(request, reply) {
  const people = request.body.people.split('\n');
  
  const reasons = require("./src/reasons.json");
  
  // Build the params object to pass to the template
  let params = { 
    seo: seo,
    people: people.map(p => p.trim()).filter(p => p.length > 0).sort(() => 0.5 - Math.random()),
    orderReason: reasons[Math.floor(Math.random() * reasons.length)]
  };
  
  // If it's not empty, let's try to find the color
  if (request.body.color) {  
    params['color'] = request.body.color;
  } else {
    // Just get a random one
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    params['color'] = colors[currentColor];
  }
  
  // The Handlebars template will use the parameter values to update the page with the chosen color
  return reply.view("/src/pages/result.hbs", params);
});

fastify.get("/order", function(request, reply) {
  const reasons = require("./src/reasons.json");
  return reply.send(reasons.sort(() => 0.5 - Math.random()));
});

// Run the server and report out to the logs
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
