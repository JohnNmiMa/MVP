from flask import render_template, flash, redirect, url_for, request, g
from flask.ext.login import login_user, logout_user, current_user, login_required
from models import User, ROLE_USER, ROLE_ADMIN
from app import app, login_manager
import pdb


@app.before_request
def before_request():
    g.user = current_user
    if g.user.is_authenticated():
        pass

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/signin/<social>', methods = ['GET', 'POST'])
def signin(social):
    if g.user is not None and g.user.is_authenticated():
        print('In signin, but already authenticated and logged in')
        return redirect(url_for('user', id=g.user.id))

    if (social == 'facebook'):
        user = User(1001, 'facejohn', 'johnmarksjr@gmail.com', ROLE_USER)
    elif (social == 'twitter'):
        user = User(1002, 'twitjohn', 'johnmarksjr@gmail.com', ROLE_USER)
    elif (social == 'google'):
        user = User(1003, 'johnmarksjr', 'johnmarksjr@gmail.com', ROLE_USER)

    # Log the user in - this will create a flask session
    #pdb.set_trace()
    login_user(user)
    return redirect(url_for('user', id=user.id))

@app.route('/user/<id>', methods = ['GET', 'POST'])
@login_required
def user(id):
    user = User.get_user(int(id))
    return render_template('user.html', name=user.name)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@login_manager.user_loader
def load_user(id):
    #pdb.set_trace()
    return User.get_user(int(id))
