from app import db, app
import flask.ext.whooshalchemy as whooshalchemy

ROLE_USER = 0
ROLE_ADMIN = 1

class User(db.Model):
    id =         db.Column(db.Integer, primary_key = True)
    google_id =  db.Column(db.String(1024), unique = True)
    fb_id =      db.Column(db.String(1024), unique = True)
    twitter_id = db.Column(db.String(1024), unique = True)
    name =       db.Column(db.String(64))
    email =      db.Column(db.String(120), index = True, unique = True)
    role =       db.Column(db.SmallInteger, default = ROLE_USER)
    topics =     db.relationship('Topic', backref = 'author', lazy = 'dynamic')

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    def __repr__(self):
        return '<User %r, email %r, google_id %r, fb_id %r, twitter_id %r, role %r>' % (self.name, self.email, self.google_id, self.fb_id, self.twitter_id, self.role)

class Topic(db.Model):
    id =       db.Column(db.Integer, primary_key = True)
    topic =    db.Column(db.String(80))
    user_id =  db.Column(db.Integer, db.ForeignKey('user.id'))
    snippets = db.relationship('Snippet', order_by='desc(Snippet.timestamp)', backref = 'topic', lazy = 'dynamic')

    def __repr__(self):
        return '<Topic %r>' % (self.topic)

class Snippet(db.Model):
    __searchable__ = ['title']

    id =          db.Column(db.Integer, primary_key = True)
    title =       db.Column(db.String(256))
    description = db.Column(db.Text)
    code =        db.Column(db.Text)
    timestamp =   db.Column(db.DateTime)
    public =      db.Column(db.Boolean)
    ref_count =   db.Column(db.Integer)
    topic_id  =   db.Column(db.Integer, db.ForeignKey('topic.id'))

    def __init__(self, title, description, code, timestamp, topic, public=False):
        self.title = title
        self.description = description
        self.code = code
        self.timestamp = timestamp
        self.public = public
        self.ref_count = 1
        self.topic = topic

    def inc_ref(self):
        self.ref_count += 1;

    def dec_ref(self):
        self.ref_count -= 1;

    def __repr__(self):
        return '<title:%r, description:%r, code:%r, timestamp:%r, public:%r, ref_count:%r>' % \
               (self.title, self.description, self.code, self.timestamp, self.public, self.ref_count)

whooshalchemy.whoosh_index(app, Snippet)
