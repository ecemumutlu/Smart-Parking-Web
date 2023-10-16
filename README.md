# Smart-Parking-Web
# SmartParkingWeb
This project aims to recommend a free parking space to the user according to his/her destination. The destinatination time will differ from the time that free parking space is requested. Hence, a prediction algorithm is developed to satisfy the user.

This project is developed under GT-ARC, BeIntelli project, which is a smart car technologies project.

To reach the BeIntelli website, click the link => ['BeIntelli'](https://be-intelli.com/)

To reach the GT-ARC website, click the link => ['GT-ARC'](https://gt-arc.com/)

## Developer Documentation
The SmartParkingWeb is developed using:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React JS](https://reactjs.org/)
- [Mongo DB](https://www.mongodb.com/)
- [Node JS](https://nodejs.org/)


### :file_folder:The layout of project folder/file structure
```
├── client 
│   ├── public
│   ├── src
|   |   ├── components
│   │   ├── img
│   │   ├── pages
|   |   │   ├── search
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.local
│   └── package.json
├── backend
│   ├── database.py
│   ├── main.py
│   ├── model.py
│   ├── .gitignore
│   ├── ratioMatrix.pickle,
│   ├── .env
├── modelfiles
│   ├── LSTM_sixstep_allsegments.keras
├── requirements_file.txt
├── .gitignore
└── README.md
```

#### **Frontend side**
##### `client`
- This folder is for the frontend side of the application.
- ##### `public`
    - This holds all of our static files.
- ##### `src`
  - This holds all of the frontend react and javascript code files.
    - ##### `components`
        - This folder contains common design codes used in the application.
    - ##### `pages`
        - This folder contains individual subfolders of code for all pages used in the application.
    - ##### `App.js`
        - This is what renders all of our browser routes and different views
    - #### `.env.local`
        - This file holds the API keys. For more information please check 'Set environment variables' section
    - ##### `index.js`
        - This is what renders the react app by rendering App.js
- ##### `package.json`
    - Defines npm behaviors and dependencies with packages for the frontend
#### **Backend side**
- ##### `database.py`
    - This folder starts the backend application and provides a database connection.
- ##### `main.py`
    - This file establishes a connection between backend and frontend of our system by using FastAPI.
- ##### `model.py`
    - This file contains all model formats to obtain MongoDB objects.
- ##### `.gitignore`
    - Tells git which files to ignore in Git
- ##### `ratioMatrix.pickle`
    - This file contains our ratio matrix to give as an input to the trained model.
#### **Other Parts**
- #### `modelfiles`
    - This file holds the trained ML model.
- #### `requirements_file.txt`
    - This file contains all necessary python libraries and their versions to launch backend.
- #### `.gitignore`
    - Tells git which files to ignore in Git
- #### `README` 
    - Informative documentation file of app

### How to build the software?
1. Install node.js from its ['website'](https://nodejs.org/en/download/current) and then install NPM with
   ```sh
   $ pip install npm
   ```
3. Install required NPM packages for frontend
   ```sh
   $ npm install && cd client && npm install
   ```
4. Install required python packages for backend by using 'requirements_file.txt' 
   ```sh
   $ pip install -r requirements_file.txt
   ```
5. Setting the env variables -> check 
    Create specified files and fill in the keys as below.
    
    #### backend/.env
    - `MONGO_URL` = the url string for your database
    - `GOOGLE_API_KEY` = the Google Maps API string
    #### client/.env.local
    - `REACT_APP_GOOGLE_MAPS_API_KEY` = the Google Maps API string
    - `REACT_APP_URL` = backend url that axios requests are sent to (ie. http://localhost:8000) 
6. To start the application
   ```sh
   $ cd 
   $ npm start
   ```

### Support
In case of any bugs or questions, here are the people you can reach:
- Elif Ecem Ümütlü - umutluecem@gmail.com
- Enis Mert Kuzu - emertkuzu35@gmail.com
- Ender Doğan Işık - 

