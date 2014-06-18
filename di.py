#!venv/bin/python
from app import db, models
from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from datetime import datetime
import os.path
import json
import pdb

snipf = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Class Definition',
    "des": """
        <p>Classes are used to create user defined datatypes.</p>
        <ul>
            <li>By convention, they are capitalized.</li>
            <li>A class is a python object, and is a template used to create class instances. A class instance is created by instantiation <em>(inst = class()</em>).</li>
            <li>Classes can have docstrings.</li>
            <li>Use the <em>pass</em> statement to define a null class.</li>
        </ul>
""",
    "code": """<pre>
class Dog:
\"\"\" This is a docstring for the Dog class. \"\"\"
    pass
>>> d = Dog()
>>> Dog.__doc__
>>> ' This is a docstring for the Dog class. '</pre>
"""
}

snipe = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Class Variables',
    "des": """
        <p>Class variables in python are shared among all of the class instances.</p>
        <ul>
            <li>If you change the class variable with the class object (class.attr = value), the value is changed in all existing and future class instances <em>(Dog.sound = 'yip')</em>.
            <li>If you change the variable through a class instance <em>(big_dog.sound = 'growl')</em> a local variable is created for that instance and added to the instance's dictionary.</li>
        </ul>
""",
    "code": """<pre>
class Dog:
    sound = 'bark'
>>> print Dog.sound
bark
>>> big_dog = Dog()
>>> small_dog = Dog()
>>> print big_dog.sound, small_dog.sound 
bark bark
>>> Dog.sound = 'yip'
>>> print big_dog.sound, small_dog.sound 
yip yip
>>> big_dog.sound = 'growl'
>>> print big_dog.sound, small_dog.sound 
growl yip</pre>
"""
}

snipd = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Built-in Class Attributes',
    "des": """
        <ul>
            <li>__dict__ Dictionary containing the class's namespace</li>
            <li>__doc__ The docstring - set to <em>None</em> if undefined</li>
            <li>__name__ Class name</li>
            <li>__module__ Module name in which the class is defined - is "__main__" in interactive mode</li>
            <li>__bases__ A tuple containing the base classes</li>
        </ul>
""",
    "code": ''
}

snipc = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Built-in Instance Attributes',
    "des": """
        <ul class="snippetTextAlone">
            <li>__dict__ Dictionary containing the instances's namespace</li>
            <li>__class__ Name of the instance's class</li>
        </ul>
""",
    "code": ''
}

snipb = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Instance Variables/Methods, Ctor/Dtor',
    "des": '',
    "code": ''
}

snipa = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Inheritance, Public/Private Attrs',
    "des": '',
    "code": ''
}

snipt = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Class Definition',
    "des": """
""",
    "code": """
"""
}
jm_snippets = [snipa, snipb, snipc, snipd, snipe, snipf]

sc_snipt = {
    'access': models.ACCESS_PUBLIC,
    'title': "",
    "des": "",
    "code": ''
}

sc_snipk = {
    'access': models.ACCESS_PRIVATE,
    'title': "Future Functionality",
    "des": "<p>The application you see now came to life by implementing a Thinkful MVP Python/Flask project. It was the author's experience that other code snippet tools have a less than useful UX experience. When you want to create a snippet, you are flashed a full page webform where you enter your snippet data. All other information on the page is locked out and the context in which the new snippet is being placed is blocked. Another weaknesses is the display and layout of the snippets. Only a few snippets are displayed on the page, and the ability to see multiple snippets at once is missing. This project was an attempt to add a better UX experience for the user plus other functionality to present in other code snippet tools.</p>\
    <p>The author has no talent in UI design, so the use of Twitter Bootstrap helped greatly. To more fully flesh out the application, the following features are envisioned as being useful for a great 'snippet management' experience:</p> \
    <ul>\
    <li>Beef up the 'description' textarea. Implement a fast WYSIWYG/Markup strategy.</li>\
    <li>Ability to 'Snip' or share snippets. Just as you can 'Pin' images in Pinterest, with SomeCode you will be able to 'Snip' code snippets. All public snippets can be 'snipped'. This will require the database to have a many-to-many relationship between a user's topics and the snippets in a topic. In other words, a topic can contain multiple snippets, and a snippet should be able to be in multiple topics (even topics from other users).</li>\
    <li>Ability to sort snippets. Sorting on time ascending/descending, alphabetical, or custom. In custom sort mode, you will be able to drag snippets up or down into an order that makes sense for the snippet topic. This is one of the weaknesses of Pinterest - you can not move your pins around in the board. With SomeCode you will be able to order your snippets as you wish.</li>\
    <li>Ability to filter snippets according to snippet language.</li>\
    <li>Ability to filter snippets according to popularity or number of times snipped. This implies that snippets will be able to be 'liked'.</li>\
    <li>Improve snippet layout so that long snippet descriptions will 'flow' around the snippet code.</li>\
    <li>Improve the Topic Panel to be able to size horizontally.</li>\
    <li>Improve responsivess for mobile devices. At small screen sizes, go into display mode only.</li>\
    <li>Create mobile apps for Anderoid, iPhone/iPad.</li>\
    <li>Improve speed of code searches. Try NoSQL database persistence.</li>\
    <li>Get UI professionally designed for best/cleanest look. This will likely require a full rewrite of the client side UI code. Although the 'grid' functionality from Twitter Bootstrap is useful, the limitations of Bootstrap was pushed to its limits.</li>\
    <li>Implement in AngularJS to be completely single-page.</li>\
    <li>Add other modules: Todo, Notes, Projects, Pomodoro, Books, Scrum-like backlog, etc. This will allow the Snippet Topic Panel to be swapped out with a 'Notes' panel or a 'Todo' panel, or whatever module the user wishes to use. When a new module panel is displayed, the central display area will display data according to a format specific to that module.</li>\
    <li>Get user feedback for desired features and enhancements.</li>\
    </ul>",
    "code": ''
}
sc_snipj = {
    'access': models.ACCESS_PUBLIC,
    'title': "Snippets can be public, so others can search and 'Snip' your snippets.",
    "des": "Just edit the snippet and toggle the eye icon to be public or private. Add public snippets displayed are displayed in a color different than snippets created by the logged in user. Only public snippets can be 'Snipped'",
    "code": ''
}
sc_snipi = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can edit snippets",
    "des": "<p>Just click on the Snippet Selector Icon, and from there you can</p><ol>\
    <li>'Snip' the snippet, by saving it to one of your topics (implemented soon). This will allow you to save a snippet created by another user into one of your snippet topics.</li>\
    <li>Change the snippet layout</li>\
    <li>Edit the snippet</li>\
    <li>Delete the snippet. If you edit the snippet, you can then change the snippet title, description, and code.</li></ol>",
    "code": ''
}
sc_sniph = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can view the snippets in three ways",
    "des": "<ol><li>In columnar mode, where the snippet description and code are side-by-side. This can be a handy way to quickly look at many short snippets.</li>\
    <li>In row mode, where the snippet description is listed in its own row above the snippet code.</li>\
    <li>'Title Only' mode, where only the title of the snippets are shown. This is handy to see many snippets at one, and then choose to show the snippet contents on a particular snippet. The snippet layout can be changed by clicking on the global or local snippet layout icons.</li></ol>",
    "code": ''
}
sc_snipg = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can create new snippets when logged in",
    "des": "<p>Just click the Snippet Add (plus) Icon, and enter the snippet title, the snippet description, and the snippet code. The description or code sections are optional. When entering a description or chunk of code, the textarea will grow or shrink as you type. Code entered in the code textarea is highlighted according to the syntax of the code's language. The description textarea is not fully implemented. Soon you will be able to enter Markdown or WYSIWYG text.<p> \
    Code snippets created by you have a different color than those created by another user. For instance, if you search for public snippets, you will see snippets created by someone else in a color different than snippets created by you.",
    "code": ''
}
sc_snipf = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can hide the Topic Panel by clicking the Topic Panel Toggle Icon",
    "des": "Clicking the Topic Panel Toggle Icon will toggle the visibility of the Topic Panel. Getting the Topic Panel out of view will give more room to display large snippets.",
    "code": ''
}
sc_snipe = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can create topics to store related snippets",
    "des": "<p>Just click the topic add icon, and enter a new topic name. Then, click on the new topic name, and you will see that there are no snippets in your new topic. You can then click the snippet add icon and start creating new snippets for that topic.",
    "code": ''
}
sc_snipd = {
    'access': models.ACCESS_PRIVATE,
    'title': "When logged in, you can do CRUD with snippets and snippet topics",
    "des": "You can create, delete, and edit snippets and snippet topics. To create, just click the Snippet Add (plus) icon in the snippet panel, or click the Topic Add (plus) icon in the topic panel. Each snippet has a snippet selector where you can edit and delete the snippet. Just hover over the snippet selector (eye) to pop up the selector bar, and then click the edit icon (pencil) or delete icon (times).",
    "code": ''
}
sc_snipc = {
    'access': models.ACCESS_PRIVATE,
    'title': "When logged in, you can search public and personal snippets",
    "des": "Just click the 'Personal' search badge to search your personal snippets, or click the 'Public' search badge to search all public snippets.",
    "code": ''
}

sc_snipb = {
    'access': models.ACCESS_PRIVATE,
    'title': 'When logged out, you can search for all public snippets in SomeCode',
    "des": "When you are viewing the SomeCode web page when not logged in, you can see how many public snippets are present in the SomeCode database, and you can search them as well. To try, search for the word 'class'",
    "code": ''
}

sc_snipa = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Welcome to SomeCode',
    "des": "<p>SomeCode is a code snippet service for coders. Store your code here, search for other developer's code, and save snippets created by others to one of your snippet topics.</p> \
    Yes, you can create buckets (topics) to store snippets. Create subject areas (jQuery, Python OO, etc.) or containers for coding tricks or notes you want to remember.",
    "code": ''
}
sc_snippets = [sc_snipk, sc_snipj, sc_snipi, sc_sniph, sc_snipg, sc_snipf, sc_snipe, sc_snipd, sc_snipc, sc_snipb, sc_snipa]

def cs():
    """ Create a snippet """

def create_db():
    db.create_all()
    if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
        api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
        api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    else:
        api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))

scgoog = {'google_id': '113145721600593244417', 'name':'SomeCode', 'email': 'somecodeapp@gmail.com', 'role':models.ROLE_ADMIN}
jfb = {'fb_id': '100002423206916', 'name':'JohnMarksJr', 'email': 'johnmarksjr@gmail.com', 'role':models.ROLE_USER}
jgoog = {'google_id': '106697488228998596996', 'name':'John', 'email': 'johnmarksjr@gmail.com', 'role':models.ROLE_USER}
jtwit = {'twitter_id': '1860746486', 'name':'jettagozoom', 'email': None, 'role':models.ROLE_USER}
users = [scgoog, jfb, jgoog, jtwit]

def add_users():
    u = None
    for user in users:
        #pdb.set_trace()
        if user['name'] == 'SomeCode':
            u = models.User(fb_id=user['google_id'], name=user['name'], email=user['email'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)
        elif user['name'] == 'JohnMarksJr':
            u = models.User(fb_id=user['fb_id'], name=user['name'], email=user['email'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)
        elif user['name'] == 'John':
            u.google_id = user['google_id']
        elif user['name'] == 'jettagozoom':
            u = models.User(twitter_id=user['twitter_id'], name=user['name'], role=user['role'])
            db.session.add(u)

            # Add the 'General' topic for the user
            topic = models.Topic(topic = 'General', author = u)
            db.session.add(topic)

            # Add the 'Welcome' topic for the user
            topic = models.Topic(topic = 'Welcome', author = u)
            db.session.add(topic)

        db.session.commit()


def add_scsnips():
    user = models.User.query.filter_by(name='SomeCode').first()
    wt = user.topics.filter_by(topic='Welcome').first()

    # Create and add the snippets
    for snip in sc_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=wt, creator_id=user.id, access=snip['access'])
        db.session.add(s)
    db.session.commit()

def add_jmsnips():
    # Get the 'General' topic
    user = models.User.query.filter_by(name='JohnMarksJr').first()
    gt = user.topics.filter_by(topic='General').first()

    # Create and add the snippets
    for snip in jm_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=gt, creator_id=user.id, access=snip['access'])
        db.session.add(s)
    db.session.commit()

def delete_snips():
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='Welcome').first()
    snips = topic.snippets.all()
    for snip in snips:
        db.session.delete(snip)
    db.session.commit()

    user = models.User.query.filter_by(name='JohnMarksJr').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        db.session.delete(snip)
    db.session.commit()

def delete_topic():
    topics = qtopic()
    for topic in topics:
        db.session.delete(topic)
    db.session.commit()

def populate_db():
    create_db()
    add_users()
    add_jmsnips()

def qusers():
    """ Find all users """
    users = models.User.query.all()
    return users
def qtopics():
    """ Find all topics """
    topics = models.Topic.query.all()
    return topics
def qsnips():
    """ Find all of a user's snippets (particular user) - order by timestamp """
    """ This requires a join """
    user = models.User.query.first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        print '*****************'
        print snip
    return snips
def qscsnips():
    """ Find all of a SomeCode's snippets - order by timestamp """
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        print '*****************'
        print snip
    return snips
def scsnips_public():
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='General').first()
    snips = topic.snippets.all()
    for snip in snips:
        snip.access = models.ACCESS_PUBLIC
        print '*****************'
        print snip
    db.session.commit()
    return snips
def qsnips2():
    """ Find all snippets in db (all users) - no ordering """
    snips = models.Snippet.query.all()
    return snips
def qsnips3():
    """ Find all snippets in db (all users) - order by timestamp """
    snips = models.Snippet.query.order_by(models.Snippet.timestamp.desc()).all()
    return snips

def jsonify_snips():
    """ Create JSON of the snippets """
    snips = models.Snippet.query.all()
    reply = {}
    reply['found'] = 'found'
    for i, snip in enumerate(snips):
        #pdb.set_trace()
        d = dict(title=snip.title, description=snip.description, code=snip.code)
        reply[i] = d
    return json.dumps(reply)

