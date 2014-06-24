import os
from flask import Flask
print("import Flask")
from flask.ext.login import LoginManager
print("import LoginManager")
from flask.ext.sqlalchemy import SQLAlchemy
print("import SQLAlchemy")
from flask.ext.oauth import OAuth
print("import OAuth")

app = Flask(__name__)
print("starting flask ")
app.config.from_object('config')
print("read app.config ")
db = SQLAlchemy(app)
print("create db ")

login_manager = LoginManager()
print("create loginManager")
login_manager.init_app(app)
print("init loginManager")
#login_manager.login_view = 'login'

oauth = OAuth()
print("create OAuth")

from app import views, models
print("import views and modles")

