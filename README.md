

# SM online-shop
 A web-based online shop written in Node.js and Ejs.
 Jest had been used for unit and intergration tests while  Selenium has been employed for end-to-end tests.
 
 
 ## Running the  application
 1) clone the repository 
 2) put  all key-values pairs for all the fields exported in the src/config/env.js file  in a .env file such as MONGO_URI
 3) run
### npm install
### npm start
 
 3) Open the browser at http://localhost:3000/ (in my case,3000 was set as the PORT number in the .env file. 
   Put your port as the port number when opening in the browser)
 
 
  ## Running  the test
 1) create an empty MongoDB database say test.
 2) Put the name of the database in the MONGO_TEST_URI field in the .env file.
 3)Download chrome driver for your chrome version and include the path 
    where one has unziped it in the PATH in the system. The chrome driver is used to run end-to-end tests
 3) Run
### npm test 
 
# Some Parts of the Application
### The home page
![home-page](https://user-images.githubusercontent.com/55924723/130409303-61e4a3ab-5293-4b72-84ca-1563bb1dc084.png)


 
the online shop offer the shop adminstrators a way to add and modify their respective products.No admin can view or modify another administrator proucts.

![Screenshot 2021-08-23 103859](https://user-images.githubusercontent.com/55924723/130409585-20901831-8e98-4855-aceb-01a374ae00b1.png)


the shop also registers user so that they can add products to the cart and can later order them and download invoices .

It also has a view for non registered users where they can view products available  in the shop.
