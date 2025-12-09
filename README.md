# therapy-website-design
Custom website designed for our client's needs as a therapist.

Specialties, services, and prices will be listed. Client can work through a 
self assessment quiz or book an appointment online by submitting a few personal details.

In order to run this page, download the repo, and open the directory link in your browser.



Deployed on the github, as well as on vercel (where we will be developing backend parts) at:
https://therapy-website-design-mtdeweeses-projects.vercel.app/




Class branch now also contains a inquire page, which allows us to have a form handling page that sends data to mongodb, as well as a call to a free llm api that lets us "check if the potential client is compatible"



Implementation
Structure of the frontend: For the client version, our frontend is fairly simply structured. Mostly composed of normal html and css, with some elements using javascript. For example the navbar is a javascript component that we use on each page, and it links each page to each other. For the class version we also have form.js - containing a component with a custom version of our Google Form that we have for the client version, allowing us to interact with our backend APIto save our data to our database, and reach out to an API. We also have admin.js, which is a component that interacts with the backend API to do login/logout, as well as display the inquiries from the database after a user is authenticated. Our frontend is reactive, adapting to different screen sizes.


	
Backend functionality: Our backend is based around a Node.js serverless API. We created a serverless API, as it was what we found to be the most easily compatible with free hosting on Vercel. We use our backend to collect the data from our inquiry form, and send it through to our MongoDB database, contact the OpenRouter API for client-therapist match, as well as provide our authentication flow for our admin panel, where it pulls data from the database. We used Passport as recommended, along with JWT for authorization. Our client version of our website does not utilize a backend as she has very simple technical requirements. Our API has the following endpoints:
/backend/inquire: Submit an inquiry to the database/get API response
/backend/admin/login: Log into the admin page (to view documents from DB)
/backend/admin/status: Checks if the user is authenticated
/backend/admin/inquiries: Gets the list of inquiries from DB (checks if authenticated).
When our frontend needs to interact with the backend it does so by sending http requests to these endpoints.


Hosting: We have the two different versions of our website (class and client) deployed using two different services. The first is on GitHub, this is our client version, and we are giving our client a copy of the client (main) branch on a separate repository in which they are an owner and can link their personal domain to the website. The second is through Vercel, which is where we deployed our class version, as it provides support for our backend api.


Database Schema: We have a fairly simple database, and since we are using MongoDB it is not a relational database. To the left is an example of a document in our database so you can see the fields we collect. Our project only utilizes create and read operations from our website. Documents are created when a potential client submits an inquiry on the website, and documents are pulled as a list for an admin to view on the admin page.


Authentication protocol: We use a Passport based authentication scheme. We use JWT in order to keep persistent sessions for authentication. We keep our admin credentials secure (as well as hashing secret)  in a .env file (that we do not push to GitHub). We utilized bcryptjs in order to hash the passwords for security. Some of the code was taken from the Passport website, but had to be adapted in order to apply to our serverless API.


API Usage: The API that our project uses is the OpenRouter API. This is essentially a gateway to free LLMs, and allows us to check if the potential client is a match for our client. We take the user’s response about why they want therapy from the inquiry form, and add that to our prompt containing details about Eliza’s specialty in therapy, then prompt the LLM (amazon/nova-2-lite-v1) to respond about how good of a match that potential client is. We do so by interacting through a HTTP Post request, and pull the response from the response. The structure for requests that the OpenRouter API wants was referenced from the OpenRouter website when working on this. The response is then displayed to the user under the inquiry form. (We added a spinning wheel to indicate progress due to feedback during the in-class session).



Form handling: We have two different forms on our project- the one for the client (google forms), and the one that connects with our API, Database. This form sends the data to our database, as well as connecting with the OpenRouter API as discussed above.


Security Practices: We kept our keys, secrets, etc within our .env files for our class version, the client version had no real requirement for secrets. We use bcryptjs for password hashing as discussed above.



Internationalization: We utilized UTF-8 encoding for our website to meet this requirement.

