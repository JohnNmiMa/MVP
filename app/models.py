from app import db, app

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
    topic =      db.relationship('Topic', backref = 'user', lazy = 'dynamic')

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
    id =    db.Column(db.Integer, primary_key = True)
    topic = db.Column(db.String(80))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Topic %r>' % (self.topic)
