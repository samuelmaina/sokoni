
# Sokoni
 Sokoni is a swahili word for 'market'. Sokoni is a web-based online shop written in Node.js with Ejs. <br/> The application has the normal online shopping functionality but controls impulsive buying behavior of customers by restricting their spending. This is enabled by periodical account recharge and tracking of currently cart products and totals. <br/>
 Jest had been used for unit and intergration tests while  Selenium has been employed for end-to-end tests.
 
 ## How the App works
 There are two  users of the application, sellers(admins) and customers.<br/>
 Sellers can add , edit and delete products from the application. They can also view their sales which are shows through dashboards with a variety of charts.
 <br/>
Customers buy products from the shop and see their purchases. They top up their balance at their own convinience which is later deduced during shopping. They are shown the current purchasd items.They can also download invoices as pdf. They have a dashboard showing their current balance and details. 
 #### Other Features
 - The home page, product page and pages for different categories have accurate paginations(first page,next page, prev, last page).
 - Good feedback message. Success messages are shown in green,errors shown in red and notifications are shown in blue.
 - Ultimate validation and standardization of input and output data.
 - Incorporation of email for signup and reset confirmations, sms for phone number validation. 
 - Mobile phone payment integration using M-PESA.
## Technologies used
 Node.js .<br/>
 Ejs <br/>
Jest for unit and integration testing.<br/>
Selenium for End-to-End testing.<br/>
Mongo DB database.<br/>
Mongoose for Object Document Mapping.<br/>
Cloudinary for image hosting.<br/>
Sendgrid for email sending.<br/>
Twillio for sms sending(used mostly for confirming telephone numbers).
MPesa (a mobile transfer platform in Eastern Africa) for account recharge.
### Other technological implementation
- Resused most page login,sign-up
- Comprehensive unit, integration and end-to-end tests
- Small and single purpose functions, classes, routes, controllers.
- Use of some design patterns such as builder pattern.

## Running the automated tests
- Some tests are failing but most are passing. Includes unit, integrated and e2e testing.
- Can watch the video from the youtube video [https://youtu.be/ata3ngksGGU](https://youtu.be/ata3ngksGGU)
![cropped](https://github.com/samuelmaina/sokoni/assets/55924723/79238f1d-e341-4c92-b150-b70af04b8a84)



# Some Parts of the Application
### The home page
![homepage](https://user-images.githubusercontent.com/55924723/183141348-122d37ef-6677-46b6-ac88-b00371a1d7b0.png)

## A logged in customer page
![logged_in_user](https://user-images.githubusercontent.com/55924723/183141444-2366985b-44f4-4442-9c72-72e9732c5816.png)


## Showing the current cart total and the current total balance when adding product to cart
![showing_the_current_balance_and_total](https://user-images.githubusercontent.com/55924723/183141728-4030ab0d-4313-43b0-b425-2641d40b3661.png)

## Refusing to add to cart when the cart total exceeds the balance
![refusing_to_add_to_cart_when_balance_is_low](https://user-images.githubusercontent.com/55924723/183141658-3275b269-d7df-40e6-b66f-9491c766510b.png)

## Product in cart
![products_in_the_cart](https://user-images.githubusercontent.com/55924723/183141778-f2b81e3e-b2fe-495f-b7a4-23244497e020.png)

## Downloading the invoice as pdf
![downloading_invoice_as_pdf](https://user-images.githubusercontent.com/55924723/183141858-5cf27a98-af14-4e30-8fac-9c3d1540a6b9.png)




<br/> <br/>
###  The Admin Page
![admin_products](https://user-images.githubusercontent.com/55924723/183142531-bb1170ec-3651-40d4-aa04-0abd3165022c.png)

### Adding Product
![Admin_adding_Products](https://user-images.githubusercontent.com/55924723/183142611-7af4f0ce-6a82-4441-beb6-69381be80481.png)

### Admin Sales
![Sales_Presentation](https://user-images.githubusercontent.com/55924723/183475626-5847f37a-519a-4a55-9935-7deb1160ab7a.png)

 
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
 


