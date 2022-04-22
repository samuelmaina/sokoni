

# SM online-shop
 A web-based online shop written in Node.js with Ejs as the templating language. It controls  the buying behavior of customers hence enabling customer to plan their budget and spend within their means.
 Jest had been used for unit and intergration tests while  Selenium has been employed for end-to-end tests.
 
 ## How the App works
 There are two  users of the application, sellers(admins) and customers.
 Sellers can create products in add , edit and delete products from the application. They can also view their sales which shows how their products have performed in turns of sales such as profit which are  displayed as charts.
 
Customers can buy products from the shop. The application stores the  balance that a user has which helps the  user in budgetting. They will top up their balance at their own convinience. Customers can download invoices of their products as pdf. They can also change the details their details including  their cell phone numbers which is used to top up their accounts.

## Technologies used
 Node.js for application development.<br/>
 Ejs templating language.<br/>
Jest for unit and integration testing.<br/>
Selenium for End-to-End testing.<br/>
Mongo DB database.<br/>
Mongoose for Object Document Mapping.<br/>
Cloudinary for image hosting.<br/>
Sendgrid for email sending.<br/>
Twillio for sms sending(used mostly for confirming telephone numbers).


 
 ## Running the  application
 1) clone the repository 
 2) put  all key-values pairs for all the fields exported in the src/config/env.js file  in a .env file such as MONGO_URI
 3) run npm install
 4) npm start
 3) Open the browser at http://localhost:3000/ (in my case,3000 was set as the PORT number in the .env file. 
   Put your port as the port number when opening in the browser)
 
 
  ## Running tests
 1) create an empty MongoDB database, say test.
 2) Put the name of the database in the MONGO_TEST_URI field in the .env file.
 3) Download chrome driver for your chrome version and include the path 
    where one has unziped it in the PATH in the system. The chrome driver is used to run end-to-end tests
 4) Run npm test 
 
# Some Parts of the Application
### The home page
![home-page](https://user-images.githubusercontent.com/55924723/130409303-61e4a3ab-5293-4b72-84ca-1563bb1dc084.png)
<br/> <br/>
###  The Admin Page
![Screenshot 2021-08-23 103859](https://user-images.githubusercontent.com/55924723/130409585-20901831-8e98-4855-aceb-01a374ae00b1.png)

