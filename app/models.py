#from app import db, app
from app import app

ROLE_USER = 0
ROLE_ADMIN = 1

class User():
    users = {}

    def __init__(self, id, name, email, role):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        User.users[self.id] = self

    #id = db.Column(db.Integer, primary_key = True)
    #name = db.Column(db.String(64), index = True, unique = True)
    #email = db.Column(db.String(120), index = True, unique = True)
    #role = db.Column(db.SmallInteger, default = ROLE_USER)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    @staticmethod
    def get_user(id):
        return User.users[id]

    def __repr__(self):
        return '<User %r>' % (self.name)

