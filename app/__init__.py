import os
from flask import Flask
from flask.ext.login import LoginManager
from flask.ext.oauth import OAuth

app = Flask(__name__)
app.config.from_object('config')

login_manager = LoginManager()
login_manager.init_app(app)
#login_manager.login_view = 'login'

oauth = OAuth()

from app import views, models

