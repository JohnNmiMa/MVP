#!venv/bin/python
from app import db, models
from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from datetime import datetime
import os.path
import json
import pdb

g_snipa = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Class Definition',
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
g_snipb = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Class Variables',
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
g_snipc = {
    'access': models.ACCESS_PUBLIC,
    'title': 'Python Built-in Attributes',
    "des": """
    Class Attributes:
        <ul>
            <li>__dict__ Dictionary containing the class's namespace</li>
            <li>__doc__ The docstring - set to <em>None</em> if undefined</li>
            <li>__name__ Class name</li>
            <li>__module__ Module name in which the class is defined - is "__main__" in interactive mode</li>
            <li>__bases__ A tuple containing the base classes</li>
        </ul>
    Instance Attributes:
        <ul class="snippetTextAlone">
            <li>__dict__ Dictionary containing the instances's namespace</li>
            <li>__class__ Name of the instance's class</li>
        </ul>
""",
    "code": ''
}
g_snippets = [g_snipc, g_snipb, g_snipa]

w_snipt = {
    'access': models.ACCESS_PUBLIC,
    'title': "",
    "des": "",
    "code": ''
}

w_snipa = {
    'access': models.ACCESS_PRIVATE,
    'title': 'Welcome to SomeCode',
    "des": "<p>SomeCode is a code snippet service for coders. Store your code here, search for other developer's code, and save snippets created by others to one of your snippet topics.</p> \
    Yes, snippets can be stored in buckets (topics) for improved snippet organization. Create subject areas (jQuery, Python OO, C++ OO etc.) or other containers to store tricks or notes you wish to remember.",
    "code": ''
}
w_snipb = {
    'access': models.ACCESS_PRIVATE,
    'title': 'When logged out, you can search for all public snippets in the SomeCode Snippet Cloud',
    "des": "Users without a SomeCode account can search any public snippet. The number of public snippets that can be searched are visible in the snippet search bar. It is envisioned, that over time as the SomeCode database grows and matures, snippet information will become a valuable resource, available to all serious coders. Enter the word 'class' to give it a try.",
    "code": ''
}
w_snipc = {
    'access': models.ACCESS_PRIVATE,
    'title': "When logged in, you can search public and personal snippets",
    "des": "<p>Just click the 'Personal' search badge to search all personal snippets, or click the 'Public' search badge to search all public snippets.</p>\
    Code snippets created by the currently logged in user are colored differently than snippets created by other users. This allows the user to quickly observe their personal snippets from the entire list of snippets on the page. To make a snippet 'public' simply set the access icon (eye) to the public state when creating or editing snippets. Be careful though, public snippets can be searched and 'Snipped' by anyone.",
    "code": ''
}
w_snipd = {
    'access': models.ACCESS_PRIVATE,
    'title': "When logged in, you can do CRUD with snippets and snippet topics",
    "des": "<p>Snippets and snippet topics can be created, edited, and deleted. To create, just click the Snippet Add (plus) icon in the snippet panel, or click the Topic Add (plus) icon in the topic panel. Each snippet has a snippet selector where the snippet can be edited or deleted. Just hover over the snippet selector (eye) to pop up the selector bar, and then click the edit icon (pencil) or delete icon (times).</p>\
    <p>All SomeCode accounts include a 'General' topic. Snippets not associated with a topic when created go into the General topic. And all snippets in a topic that is deleted will be moved to the General topic.</p>\
    <p>To add a snippet to a snippet topic, first select the snippet topic by clicking on the topic name. Next, click the snippet add icon and enter the snippet contents. Click 'Save' and the new snippet will be added to the currently selected topic.</p>\
    <p>Each snippet has three main parts - the title, description, and code. The title is required whereas the description and code are optional. To quickly create multiple snippets, just add the titles up front and add the description or code later on.</p>\
    When entering a description or chunk of code, the textarea will grow or shrink as you type. Code entered in the code textarea is highlighted according to the syntax of the code's language. The description textarea is not fully implemented. Soon you will be able to enter Markdown or WYSIWYG text.",
    "code": ''
}
w_snipe = {
    'access': models.ACCESS_PRIVATE,
    'title': "Snippets in a topic can be displayed by the click of a button",
    "des": "Simply click on the topic name and all snippets in the topic will be displayed. Only the snippet display area of the page is updated and does not require a full page refresh. This provides a clean user experince without annoying page refreshes.",
    "code": ''
}
w_snipf = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can hide the Topic Panel by clicking the Topic Panel Toggle Icon",
    "des": "Clicking the Topic Panel Toggle Icon will toggle the visibility of the Topic Panel. Getting the Topic Panel out of view will give more room to display large snippets.",
    "code": ''
}
w_snipg = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can view the snippets in three ways",
    "des": "<ol><li>'Columnar' mode, where the snippet description and code are side-by-side. This can be a handy way to quickly look at many short snippets.</li>\
    <li>'Row' mode, where the snippet description is listed in its own row above the snippet code.</li>\
    <li>'Title Only' mode, where only the title of the snippets are shown. This is handy for viewing many snippets at once and then selecting only the snippet of interest. The snippet layout can be changed by clicking on the global or local snippet layout icons.</li></ol>",
    "code": ''
}
w_sniph = {
    'access': models.ACCESS_PRIVATE,
    'title': "You can interact with individual snippets",
    "des": "<p>Just click on the Snippet Selector Icon, and from there you can</p><ol>\
    <li>'Snip' the snippet (implemented soon) by saving it to one of the available topics. This will allow a snippet created by another user to be saved into any snippet topic. This is similar to pinning a pin in Pinterest. Just select the topic where the snippet is to reside.</li>\
    <li>Change the snippet layout</li>\
    <li>Edit the snippet. The snippet title, description, and code can be changed.</li>\
    <li>Delete the snippet</li></ol>",
    "code": ''
}
w_snipi = {
    'access': models.ACCESS_PRIVATE,
    'title': "Snippets can be public, so others can search and 'Snip' your snippets.",
    "des": "Just edit the snippet and toggle the eye icon to be public or private. All public snippets are displayed in a color different than snippets created by the logged in user. Public snippets can be 'Snipped' to any available topic, or personal snippets can be snipped to multiple topics in the account. Be careful though, public snippets can be search and 'Snipped' by anyone.",
    "code": ''
}
w_snipj = {
    'access': models.ACCESS_PRIVATE,
    'title': "Future Functionality",
    "des": "<p>The application you see now came to life as an MVP project in Thinkful's 'Programming in Python' (Python/Flask) class. It was the author's experience that other code snippet tools have a less than useful UX experience. When you want to create a snippet, you are flashed a full page webform where you enter your snippet data. All other information on the page is locked out and the context in which the new snippet is being placed is blocked. Another weaknesses is the display and layout of the snippets. Only a few snippets are displayed on the page, and the ability to see multiple snippets at once is missing. This application was an attempt to add a better UX experience for the user with the addition of functionality not present in other code snippet tools.</p>\
    <p>To more fully flesh out the application, the following features are envisioned as being useful for a great 'snippet management' experience:</p> \
    <ul>\
    <li>Beef up the 'description' textarea. Implement a fast WYSIWYG/Markup strategy.</li>\
    <li>Beef up the snippet bar. Add a snippet language selector and a topic selector.</li>\
    <li>Implement the setting panel. Provide a default snippet layout, default snippet personal/public color, etc.</li>\
    <li>Ability to 'Snip' or share snippets. Just as you can 'Pin' images in Pinterest, with SomeCode you should be able to 'Snip' code snippets. All public snippets can be 'snipped'. This will require the database to have a many-to-many relationship between a user's topics and the snippets in a topic. In other words, a topic can contain multiple snippets, and a snippet should be able to be in multiple topics, with topics being from the local logged in user or those from any other user on the system.</li>\
    <li>Ability to sort snippets, sorting on time, alphabetically, or custom. In custom sort mode, you will be able to drag snippets up or down into an order that makes sense for the snippet topic. This is one of the weaknesses of Pinterest - you can not move your pins around in the board. With SomeCode you will be able to order your snippets as you wish.</li>\
    <li>Ability to filter snippets according to snippet language.</li>\
    <li>Ability to filter snippets according to popularity or number of times snipped. This implies that snippets will be able to be 'liked'.</li>\
    <li>Improve snippet layout so that long snippet descriptions will 'flow' around the snippet code.</li>\
    <li>Improve the Topic Panel to be able to size horizontally.</li>\
    <li>Improve responsivess for mobile devices. At small screen sizes, go into display mode only.</li>\
    <li>Improve speed of code searches. Try NoSQL database persistence.</li>\
    <li>Implement in AngularJS to be completely single-page.</li>\
    <li>Get UI professionally designed for best/cleanest look. This will likely require a full rewrite of the client side UI code. Although the 'grid' functionality from Twitter Bootstrap is useful, it was pushed to its limits. This app needs a custom built UI.</li>\
    <li>Create mobile apps for Anderoid, iPhone/iPad.</li>\
    <li>Add other modules: Todo, Notes, Projects, Pomodoro, Books, Scrum-like backlog, etc. This will allow the Snippet Topic Panel to be swapped out with a 'Notes' panel or a 'Todo' panel, or whatever module the user wishes to use. When a new module panel is displayed, the central display area will display data according to a format specific to that module.</li>\
    <li>Get user feedback for desired features and enhancements.</li>\
    </ul>",
    "code": ''
}
w_snippets = [w_snipj, w_snipi, w_sniph, w_snipg, w_snipf, w_snipe, w_snipd, w_snipc, w_snipb, w_snipa]

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
#users = [scgoog, jfb, jgoog, jtwit]
users = [scgoog]

def add_users():
    u = None
    for user in users:
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


def add_snips():
    add_scsnips()
    user = None
    for user in users:
        u = models.User.query.filter_by(name=user['name']).first()
        if user['name'] == 'SomeCode':
            # SomeCode's snippets must be added first, so we do that above in this function
            #add_scsnips()
            pass
        elif user['name'] == 'JohnMarksJr':
            # Add the 'Welcome' snippets using SomeCode's Welcome snippets
            add_usersnips(u)
        elif user['name'] == 'John':
            pass
        elif user['name'] == 'jettagozoom':
            # Add the 'Welcome' snippets using SomeCode's Welcome snippets
            add_usersnips(u)

def add_scsnips():
    add_wsnips() # add SomeCode's 'Welcome' snippets
    add_gsnips() # add SomeCode's 'General' snippets

def add_wsnips():
    user = models.User.query.filter_by(name='SomeCode').first()
    wt = user.topics.filter_by(topic='Welcome').first()

    # Create and add the 'Welcome' snippets
    for snip in w_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=wt, creator_id=user.id, access=snip['access'])
        db.session.add(s)
    db.session.commit()

def add_gsnips():
    # Get the 'General' topic
    user = models.User.query.filter_by(name='SomeCode').first()
    gt = user.topics.filter_by(topic='General').first()

    # Create and add the 'General' snippets
    for snip in g_snippets:
        s = models.Snippet(title = snip['title'], description = snip['des'], code = snip['code'],
                           timestamp = datetime.utcnow(), topic=gt, creator_id=user.id, access=snip['access'])
        db.session.add(s)
    db.session.commit()

def add_usersnips(user):
    # Get SomeCode's 'Welcome' topic
    #pdb.set_trace()
    sc_user = models.User.query.filter_by(name='SomeCode').first()
    wt = sc_user.topics.filter_by(topic='Welcome').first()
    w_snippets = wt.snippets

    # Get the user's 'Welcome' topic
    gt = user.topics.filter_by(topic='Welcome').first()

    # Add SomeCodes 'Welcome' snippets to the user's 'Welcome' topic.
    snippets = w_snippets.all()
    snippets.reverse()
    for snip in snippets:
        s = models.Snippet(title = snip.title, description = snip.description, code = snip.code,
                           timestamp = datetime.utcnow(), topic=gt, creator_id=user.id, access=models.ACCESS_PRIVATE)
        db.session.add(s)
    db.session.commit()

def delete_snips():
    user = models.User.query.filter_by(name='SomeCode').first()
    topic = user.topics.filter_by(topic='Welcome').first()
    snips = topic.snippets.all()
    for snip in snips:
        db.session.delete(snip)
    db.session.commit()

    user = models.User.query.filter_by(name='SomeCode').first()
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
    add_snips()

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

