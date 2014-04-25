from flask import render_template, flash, redirect, url_for, session, request, g
from flask.ext.login import login_user, logout_user, current_user, login_required
from models import User, ROLE_USER, ROLE_ADMIN
from app import app, login_manager, oauth
from facebook_oauth import facebook
from twitter_oauth import twitter
from google_oauth import google
from datetime import datetime
import pdb


@app.before_request
def before_request():
    g.user = current_user
    if g.user.is_authenticated():
        g.user.last_seen = datetime.utcnow()


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/signin/<social>')
def signin(social):
    if g.user is not None and g.user.is_authenticated():
        print('In signin, but already authenticated and logged in')
        return redirect(url_for('user'))

    if (social == 'facebook'):
        return facebook.authorize(callback=url_for('facebook_authorized',
            next=request.args.get('next') or request.referrer or None,
            _external=True))
    elif (social == 'twitter'):
        return twitter.authorize(callback=url_for('twitter_authorized',
            next=request.args.get('next') or request.referrer or None))
    elif (social == 'google'):
        return google.authorize(callback=url_for('google_authorized', _external=True))

    # Log the user in - this will create a flask session
    return redirect(url_for('user'))


@app.route('/user')
#@login_required
def user():
    return render_template('user.html', name=g.user.name)


@app.route('/logout')
@login_required
def logout():
    pop_login_session()
    logout_user()
    return redirect(url_for('index'))


###
### Facebookk OAuth

@app.route('/signin/facebook_authorized')
@facebook.authorized_handler
def facebook_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None or 'access_token' not in resp:
        #return redirect(next_url)
        flash(u'<h5>Facebook login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    # The session must contain the access token before you can query the facebook API (such as
    # calling facebook.get('/me')
    session['logged_in'] = True
    session['oauth_token'] = (resp['access_token'], '')
    me = facebook.get('/me')
    #print("response user id, username & email = {}, {} & {}").format(me.data['id'], me.data['username'], me.data['email'])
    #pdb.set_trace()

    user = User(1001, me.data['username'], me.data['email'], ROLE_USER)
    login_user(user)

    return redirect(url_for('user'))

@facebook.tokengetter
def get_facebook_oauth_token():
    return session.get('oauth_token')


###
### Twitter OAuth

@app.route('/signin/twitter_authorized')
@twitter.authorized_handler
def twitter_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None:
        flash(u'<h5>Twitter login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    session['logged_in'] = True
    session['oauth_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    session['twitter_user'] = resp['screen_name']
    #print("response user_id and screen_name = {} and {}").format(resp['user_id'], resp['screen_name'])
    #pdb.set_trace()

    user = User(1002, resp['screen_name'], '', ROLE_USER)
    login_user(user)

    #return redirect(next_url)
    return redirect(url_for('user'))

@twitter.tokengetter
def get_twitter_oauth_token():
    return session.get('oauth_token')


###
### Google OAuth

@app.route('/signin/google_authorized')
@google.authorized_handler
def google_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None or 'access_token' not in resp:
        flash(u'<h5>Google login error - please try logging in again!</h5>', 'error')
        return redirect(next_url)

    # Get the users oauth information
    from urllib2 import Request, urlopen, URLError, HTTPError
    import json

    access_token = resp['access_token']
    headers = {'Authorization': 'OAuth '+access_token}
    req = Request('https://www.googleapis.com/oauth2/v1/userinfo',
                  None, headers)
    try:
        response = urlopen(req)
    except HTTPError as e:
        if e.code == 401:
            # Unauthorized - bad token
            flash(u'<h5>Google login error - please try logging in again!</h5>', 'error')
            return redirect(next_url)

    # Save the access token away
    session['logged_in'] = True
    session['oauth_token'] = access_token, ''
    #print("response user id, username & email = {}, {} & {}").format(me['id'], me['name'], me['email'])
    #pdb.set_trace()

    # Log the user in
    me = json.load(response)
    user = User(int(me['id']), me['given_name'], me['email'], ROLE_USER)
    login_user(user)

    return redirect(url_for('user'))

@google.tokengetter
def get_google_access_token():
    #pdb.set_trace()
    return session.get('oauth_token')


def pop_login_session():
    session.pop('logged_in', None)
    session.pop('oauth_token', None)


@login_manager.user_loader
def load_user(id):
    return User.get_user(int(id))

