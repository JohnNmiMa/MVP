import os
from flask import Flask
console.log("import Flask")
from flask.ext.login import LoginManager
console.log("import LoginManager")
from flask.ext.sqlalchemy import SQLAlchemy
console.log("import SQLAlchemy")
from flask.ext.oauth import OAuth
console.log("import OAuth")

app = Flask(__name__)
console.log("starting flask ")
app.config.from_object('config')
console.log("read app.config ")
db = SQLAlchemy(app)
console.log("create db ")

login_manager = LoginManager()
console.log("create loginManager")
login_manager.init_app(app)
console.log("init loginManager")
#login_manager.login_view = 'login'

oauth = OAuth()
console.log("create OAuth")

from app import views, models
console.log("import views and modles")

