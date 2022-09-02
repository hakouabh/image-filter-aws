import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', async (req, res) => {
    
    let image_url:string  = req.query.image_url;
        
    // 1- validate the image_url query 
    const valid_url = image_url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

    if(!valid_url)
    return res.status(400).send('Inavlid url');
    
    // 2. call filterImageFromURL(image_url) to filter the image
    const filteredImage = await filterImageFromURL(image_url);

    if(!filteredImage)
    return res.status(400).send(`Unable to filter the Image`);
    
    // 4. deletes any files on the server on finish of the response
    res.on('finish', function() {
      deleteLocalFiles([filteredImage])
    });
    
    // 3. send the resulting file in the response
    return res.status(200).sendFile(filteredImage);
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try this link /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
  } );
})();