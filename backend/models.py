from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import nullsfirst
from werkzeug.security import generate_password_hash, check_password_hash
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    ratings = db.relationship('Rating', back_populates='user', lazy=True)
    recommendations = db.relationship('Recommendation', back_populates='user', lazy=True)


    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self._password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self._password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'



class Manga(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False,unique=True)
    author = db.Column(db.String(255), nullable=False)
    # genre = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    cover_image_url = db.Column(db.String(255),nullable=True)
    publication_year = db.Column(db.Integer, nullable=False)
    publication_status = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_featured = db.Column(db.Boolean,nullable=False,default=False)
    tags = db.relationship('Tag',secondary='manga_tags', backref='mangas', lazy=True)

    ratings = db.relationship('Rating', back_populates='manga', lazy=True)
    recommendations = db.relationship('Recommendation', back_populates='manga', lazy=True)

    def to_json(self):
        manga_dict = {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "description": self.description,
            "imageUrl": self.image_url,
            "coverImageUrl": self.cover_image_url,
            "publicationYear": self.publication_year,
            "publicStatus": self.publication_status,
            "createdAt": self.created_at,
            "isFeatured": self.is_featured,
            "tags": [tag.name for tag in self.tags],
            "ratings": [rating.to_json() for rating in self.ratings],
        }
        return manga_dict

    def __repr__(self):
        return f'<Manga {self.title}>'

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='ratings', lazy=True)
    manga = db.relationship('Manga', back_populates='ratings', lazy=True)

    __table_args__ = (db.UniqueConstraint('user_id', 'manga_id',name='_user_manga_uc'),)

    def to_json(self):
        rating_dict = {
            "id": self.id,
            "userId": self.user_id,
            "mangaId": self.manga_id,
            "rating": self.rating,
            "created_at": self.created_at,
        }
        return rating_dict

    def __repr__(self):
        return f'<Rating: User {self.user_id} - Manga {self.manga_id} - {self.rating}>'

class Recommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manga_id = db.Column(db.Integer, db.ForeignKey('manga.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship('User', back_populates='recommendations', lazy=True)
    manga = db.relationship('Manga', back_populates='recommendations', lazy=True)

    def to_json(self):
        recommendation_dict = {
            "id": self.id,
            'userId': self.user_id,
            'mangaId': self.manga_id,
            'score': self.score,
            'reason': self.reason,
            'created_at': self.created_at
        }
        return recommendation_dict

    def __repr__(self):
        return f'<Recommendation: User {self.user_id} - Manga {self.manga_id}>'

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False,unique=True)

    def to_json(self):
        tag_dict = {
            "id": self.id,
            "name": self.name
        }
        return tag_dict

    def __repr__(self):
        return f'<Tag: {self.name}>'

manga_tags = db.Table('manga_tags',
                      db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'),primary_key=True),
                      db.Column('manga_id', db.Integer, db.ForeignKey('manga.id'),primary_key=True)
                      )

class Favourite(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    manga_id = db.Column(db.Integer,db.ForeignKey('manga.id'),nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id'),nullable=False)
    manga_id = db.Column(db.Integer,db.ForeignKey('manga.id'),nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
