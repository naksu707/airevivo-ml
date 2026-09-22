# AireVivo — Air Quality Prediction in Valle del Cauca

**Final Project — Machine Learning**

AireVivo is a web-based tool developed as the final project for the Machine Learning course. Its purpose is to analyze historical air quality data and use machine learning techniques to support the prediction of Air Quality Index (AQI) categories in Valle del Cauca.

The project integrates a web application, an API, an SQLite database, and a Machine Learning model trained using data from SISAIRE — IDEAM.

---

## Objective

Develop a technology-based tool using a supervised classification model to analyze historical air quality data and generate predictions regarding Air Quality Index categories.

The system is intended to serve as a prototype to support the identification of air quality conditions that may require attention.

---

## Context

Air quality is an environmental and public health issue, particularly in urban areas where factors such as population growth, vehicle traffic, and various human activities can affect particulate matter concentrations.

AireVivo proposes a technological solution that combines:

* Historical air quality data.
* Data processing and cleaning.
* Exploratory analysis.
* Feature engineering.
* Machine Learning.
* Interactive visualization.
* Prediction system.
* Role-based access control.

---

## Data Source

The data used in the project comes from:

**SISAIRE — Air Quality Information System**

Institutional source:

**IDEAM — Institute of Hydrology, Meteorology and Environmental Studies**

The data corresponds to records collected from air quality monitoring stations.

The current version of the dataset contains information related to:

* Monitoring station.
* Measurement date.
* PM2.5.
* Derived temporal variables.

> **Note:** The current version of the dataset used in the prototype does not contain all the meteorological variables originally proposed during the project formulation. Therefore, artificial meteorological data is not generated to complete the dataset.

---

# Machine Learning

The project uses a supervised classification learning approach.

The objective of the model is to determine the air quality category based on the available variables.

The trained model is stored in `.joblib` format and is used by the backend to generate predictions through the web application.

### Model

The current implementation integrates:

**Random Forest Classifier**

Location:

```text
modelo/modelo_taller3_clasificacion.joblib
```

The project is prepared to further expand the process of algorithm comparison and hyperparameter optimization.

---

## Methodological Consideration

One of the important aspects of the project is avoiding data leakage.

If the AQI category is directly constructed from PM2.5 for the same point in time, using that same PM2.5 value as an input variable to predict the corresponding category may introduce information leakage.

For a version focused on future prediction, variables available before the prediction time should be used, such as:

* Historical or lagged PM2.5 values.
* Moving averages.
* Available meteorological variables.
* Temporal variables.
* Other variables available before the prediction horizon.

This consideration should be taken into account when interpreting the model's results.

---

# Web Application

AireVivo is composed of different components:

```text
AireVivo
│
├── Frontend
│   └── Next.js / React / TypeScript
│
├── Backend
│   └── FastAPI / Python
│
├── Machine Learning
│   └── scikit-learn / Joblib
│
└── Database
    └── SQLite
```

### Frontend

Developed using:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

The frontend provides the user interface, navigation, visualizations, and management of different functionalities according to the user's role.

### Backend

Developed using:

* Python
* FastAPI
* Pandas
* NumPy
* scikit-learn
* Joblib

The backend is responsible for:

* Querying SQLite.
* Processing information.
* Exposing the API.
* Loading the Machine Learning model.
* Generating predictions.
* Providing statistics to the frontend.
* Managing user- and permission-related operations.

### Database

The project uses SQLite as its storage system.

The database contains information related to:

* Air quality records.
* Predictions.
* Models.
* Users.
* Roles.
* Favorite stations.
* Alert preferences.
* Administrative logs.

---

# User Roles

AireVivo implements a role-based access control (RBAC) system.

## Visitor

Visitors do not need to log in.

They can access:

* Home.
* General project information.
* Objectives.
* Methodology.
* Data source.

Visitors cannot access:

* Dashboard.
* Data.
* Predictions.
* Monitoring network.
* Analysis.
* Model.
* Administration.

---

## User

Public registration automatically creates an account with the following role:

```text
User
```

Registered users can access:

* Dashboard.
* Predictions.
* Monitoring network.
* Favorite stations.
* Alerts.
* Profile.
* Project information.

Users cannot modify their own role.

---

## Analyst

The Analyst role cannot be assigned through public registration.

This role must be assigned directly through the backend or database by a person with administrative permissions.

Analysts have additional access to:

* Data.
* Analysis.
* Technical model information.
* Metrics.
* Prediction history.
* Information about the variables used.

Analysts can consult and analyze technical information, but they cannot modify administrative system configurations or manage other users.

---

## Administrator

The Administrator role cannot be assigned through public registration either.

It must be assigned directly through the backend or database.

Administrators have full access to:

* Users.
* Data.
* Stations.
* Model.
* Configuration.
* Logs.
* Administrative functions.

Administrators can manage the different roles and permissions within the system.

---

# Role Management

The system uses three authenticated roles:

```text
User
Analyst
Administrator
```

The registration flow works as follows:

```text
Public Registration
       |
       v
New User
       |
       v
Role: User
```

Roles with higher permissions cannot be selected during public registration.

To assign a user as an Analyst or Administrator, the change must be made through:

* Backend.
* SQLite database.
* Authorized administrative tool.

This prevents users from registering themselves with elevated permissions.

---

# Project Structure

```text
airevivo-ml/
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── data/
│   │   ├── login/
│   │   ├── monitoring/
│   │   ├── prediction/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── source/
│   │   └── ...
│   │
│   ├── components/
│   ├── config/
│   ├── data/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── modelo/
│   ├── reporte_sisaire.csv
│   └── modelo_taller3_clasificacion.joblib
│
├── docker-compose.yml
└── README.md
```

---

# Installation

## Requirements

To run the project locally, it is recommended to have the following installed:

* Docker
* Docker Compose
* Git

The services can also be run individually using Node.js and Python.

---

# Running with Docker

The recommended way to run the project is through Docker Compose.

Clone the repository:

```bash
git clone https://github.com/TU-USUARIO/airevivo-ml.git
```

Enter the project directory:

```bash
cd airevivo-ml
```

Start the services:

```bash
docker compose up --build
```

Once the services are running:

### Web Application

```text
http://localhost:3000
```

### API

```text
http://localhost:8000
```

### Health Check

```text
http://localhost:8000/api/health
```

To stop the application:

```bash
docker compose down
```

---

# API

The backend exposes different endpoints for the application.

Some of the main endpoints are:

```text
GET /api/health
GET /api/stations
GET /api/records
GET /api/stats
GET /api/analytics
GET /api/model
GET /api/predict
```

Routes containing restricted information are protected according to the user's role.

---

# Features

AireVivo currently includes:

* Landing page
* Project information
* Data source
* User registration
* Login
* Logout
* Roles and permissions
* Dashboard
* Data visualization
* Monitoring network
* Machine Learning-based prediction
* SQLite database
* FastAPI
* `.joblib` model integration
* Docker Compose
* Administrative panel
* User management
* Favorites system
* Alert system
* Administrative logs

---

# Machine Learning Process

The development of the Machine Learning component includes the following stages:

```text
SISAIRE Data
      ↓
Exploration and Cleaning
      ↓
Variable Transformation
      ↓
Feature Engineering
      ↓
Data Splitting
      ↓
Training
      ↓
Model Comparison
      ↓
Evaluation
      ↓
Optimization
      ↓
Final Model
      ↓
Integration with AireVivo
```

The evaluation metrics should pay particular attention to performance on alert categories, prioritizing metrics such as:

* Recall.
* F1-score.
* Precision.
* Confusion matrix.

This makes it possible to evaluate not only the number of correct predictions, but also the model's ability to detect categories of greater importance.

---

# Security and Permissions

The application uses a role-based access control (RBAC) system.

Public information is limited to:

* General information.
* Project description.
* Methodology.
* Data source.

Access to:

* Data.
* Dashboard.
* Predictions.
* Analysis.
* Administration.

depends on the user's access level.

Restrictions are applied both to the user interface and to protected backend endpoints.

Public registration always assigns the `User` role.

The `Analyst` and `Administrator` roles must be assigned through authorized internal mechanisms.

---

# Design

AireVivo uses a visual identity related to:

* Nature.
* Technology.
* Air quality.
* Environmental monitoring.

The interface is designed to be:

* Responsive.
* Accessible.
* Visual.
* Simple for general users.
* Technical for analyst users.
* Administrative for users with elevated permissions.

---

# Technologies

| Area                | Technology     |
| ------------------- | -------------- |
| Frontend            | Next.js        |
| Frontend Language   | TypeScript     |
| UI                  | React          |
| Styling             | Tailwind CSS   |
| Components          | shadcn/ui      |
| Charts              | Recharts       |
| Backend             | FastAPI        |
| Backend Language    | Python         |
| Machine Learning    | scikit-learn   |
| Data Processing     | Pandas / NumPy |
| Model Serialization | Joblib         |
| Database            | SQLite         |
| Containers          | Docker         |
| Orchestration       | Docker Compose |

---

# Academic Context

This project was developed as the final project for the **Machine Learning** course.

The project integrates knowledge of:

* Exploratory data analysis.
* Data cleaning and transformation.
* Feature engineering.
* Supervised learning.
* Classification.
* Model evaluation.
* Data leakage prevention.
* Machine Learning model integration.
* API development.
* Data visualization.
* Web application development.
* User and permission management.

---

# Current Limitations

The current version should be considered an academic MVP.

The main limitations include:

* The currently available dataset does not contain all the meteorological variables initially proposed.
* The quality of future predictions depends on having variables known before the prediction time.
* The model should continue to be evaluated with particular attention to alert classes.
* Predictions should be interpreted as technological support and not as a replacement for official measurements.
* Future integration may incorporate additional meteorological data and urban coverage variables.

---

# Future Work

Possible improvements include:

* Integrating real meteorological variables.
* Incorporating additional historical data.
* Using lag variables and moving windows.
* Comparing more classification algorithms.
* Optimizing hyperparameters.
* Improving the detection of critical classes.
* Incorporating temporal validation.
* Automating data updates.
* Implementing notifications.
* Improving the multi-hour prediction system.
* Deploying the application in a production environment.

---

# Data Source

The data used in the project comes from:

**SISAIRE — IDEAM**

The application uses this source as the foundation for the development and evaluation of the prototype.

---

# Project Status

**Machine Learning Final Project — Functional MVP**

AireVivo currently integrates the following workflow:

```text
Data → Machine Learning → API → Web Application
```

with an architecture prepared to continue evolving toward an air quality prediction and monitoring tool.

---

## Author

**Maria Jose Ospina**

Final Project — Machine Learning

**Universidad San Buenaventura**

**2026**
