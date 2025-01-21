from flask import Flask, request,jsonify
from models import db, User, Manga, Tag, Rating, Favourite, SearchHistory
from flask_cors import CORS
import requests
from sqlalchemy import or_, desc, func
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity,JWTManager,decode_token



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///manga.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'SECRET_KEY'
app.config['JWT_SECRET_KEY'] = 'JWT_SECRET_KEY'
CORS(app,supports_credentials=True)
db.init_app(app)
migrate = Migrate(app,db)
jwt = JWTManager(app)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/sign-up',methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data or 'email' not in data:
            return jsonify({'message': 'Please provide username,password and email'}),401

        username = data['username']
        password = data['password']
        email = data['email']

        user_exist = User.query.filter_by(username=username).first()
        email_exist = User.query.filter_by(email=email).first()

        if user_exist:
            return jsonify({'message': 'Username already exists'}),400
        if email_exist:
            return jsonify({'message': 'Email already exists'}),400

        new_user = User(username=username,
                        email=email)
        new_user.password = password
        db.session.add(new_user)
        try:
            db.session.commit()
            return jsonify({'message': 'User created successfully',
                            'username': new_user.username,
                            'email': new_user.email,
                            'id': new_user.id}),200
        except Exception as e:
            return jsonify({'message': f"Error during user creation {str(e)}"}), 401


    except Exception as e:
        return jsonify({'message': f"Error during user creation {str(e)}"}), 500




@app.route("/login",methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Please provide username and password'}), 401
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            access_token = create_access_token(identity=username)
            return jsonify({'message': 'Login successful',
                            'accessToken': access_token,
                            'id': user.id,
                            'username': user.username}),200
        else:
            return jsonify({'error': 'Invalid username or password'}), 400

    except Exception as e:
        return jsonify({'error': f"Error during login {str(e)}"}), 401


@app.route("/user_history",methods=["GET"])
@jwt_required()
def get_user_history():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 24, type=int)
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        user_history = SearchHistory.query.filter_by(user_id=user.id).order_by(desc(SearchHistory.created_at)).all()

        mangas_ids = [history.manga_id for history in user_history]

        query = Manga.query.filter(Manga.id.in_(mangas_ids))

        average_rating = func.avg(Rating.rating).label('average_rating')
        query = query.outerjoin(Rating).group_by(Manga.id).add_columns(average_rating)

        manga_id_to_position = {manga_id: index for index, manga_id in enumerate(mangas_ids)}


        mangas_page = query.paginate(page=page, per_page=per_page)
        mangas_list = []

        for manga, avg_rating in mangas_page.items:
            manga_json = manga.to_json()
            manga_json['averageRating'] = avg_rating if avg_rating else 0
            mangas_list.append((manga_id_to_position[manga_json['id']],manga_json))

        mangas_list.sort(key=lambda item: item[0])
        mangas_list = [item[1] for item in mangas_list]

        print(mangas_list)

        return jsonify({
            "mangas": mangas_list,
            "total_pages": mangas_page.pages,
            "current_page": mangas_page.page,
            "per_page": mangas_page.per_page,
        })
    except Exception as e:
        print(e)
        return jsonify({"Error": f"Error getting user history {str(e)}"}),400

@app.route("/recent_manga",methods=["GET"])
@jwt_required()
def get_recent_manga():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 24, type=int)
    try:

        query = Manga.query.filter(
            ~Manga.tags.any(Tag.name == "Hentai")
        ).order_by(desc(Manga.created_at))


        average_rating = func.avg(Rating.rating).label('average_rating')
        query = query.outerjoin(Rating).group_by(Manga.id).add_columns(average_rating)

        mangas_page = query.paginate(page=page, per_page=per_page)
        mangas_list = []

        for manga, avg_rating in mangas_page.items:
            manga_json = manga.to_json()
            manga_json['averageRating'] = avg_rating if avg_rating else 0
            mangas_list.append(manga_json)


        print(mangas_list)

        return jsonify({
            "mangas": mangas_list,
            "total_pages": mangas_page.pages,
            "current_page": mangas_page.page,
            "per_page": mangas_page.per_page,
        })
    except Exception as e:
        print(e)
        return jsonify({"Error": f"Error getting user history {str(e)}"}),400

@app.route("/user_favourites",methods=["GET"])
@jwt_required()
def get_user_favourites():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 24, type=int)
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        user_favourite = Favourite.query.filter_by(user_id=user.id).order_by(desc(Favourite.created_at)).all()

        mangas_ids = [favourite.manga_id for favourite in user_favourite]

        query = Manga.query.filter(Manga.id.in_(mangas_ids))

        average_rating = func.avg(Rating.rating).label('average_rating')
        query = query.outerjoin(Rating).group_by(Manga.id).add_columns(average_rating)

        manga_id_to_position = {manga_id: index for index, manga_id in enumerate(mangas_ids)}


        mangas_page = query.paginate(page=page, per_page=per_page)
        mangas_list = []

        for manga, avg_rating in mangas_page.items:
            manga_json = manga.to_json()
            manga_json['averageRating'] = avg_rating if avg_rating else 0
            mangas_list.append((manga_id_to_position[manga_json['id']],manga_json))

        mangas_list.sort(key=lambda item: item[0])
        mangas_list = [item[1] for item in mangas_list]

        print(mangas_list)

        return jsonify({
            "mangas": mangas_list,
            "total_pages": mangas_page.pages,
            "current_page": mangas_page.page,
            "per_page": mangas_page.per_page,
        })
    except Exception as e:
        print(e)
        return jsonify({"Error": f"Error getting user history {str(e)}"}),400


@app.route("/mangas",methods=['GET'])
def get_mangas():
    """Receives request from the React frontend containing user's current page and
    how many mangas it should fetch per page looking like this :
     const response = await axios.get(`http://127.0.0.1:5000/mangas?page=${currentPage}&per_page=${mangasPerPage}`)

     The API returns list of mangas,number of total pages,user's current page
     and how many mangas it should fetch per page
     while filtering for unsafe tags.
     """

    page = request.args.get('page',1,type=int)
    per_page = request.args.get('per_page',24,type=int)
    search_term = request.args.get('search',"",type=str)
    sort_by = request.args.get('sort_by',"",type=str)
    order = request.args.get('order',"asc",type=str)
    is_featured = request.args.get('is_featured',False,type=bool)
    publication_status = request.args.get('publication_status',"",type=str)
    publication_year = request.args.get('publication_year',"",type=str)
    author = request.args.get('author',"",type=str)
    tags = request.args.get('tags',"",type=str)

    query = Manga.query.filter(
        ~Manga.tags.any(Tag.name == "Hentai")
    )

    if search_term:
        query = query.filter(or_(Manga.title.contains(search_term)))

    if is_featured:
        query = query.filter(Manga.is_featured == is_featured)

    if publication_status:
        query = query.filter(Manga.publication_status == publication_status)

    if publication_year:
        try:
            year = int(publication_year)
            query = query.filter(Manga.publication_year == year)
        except ValueError:
            pass

    if author:
        query = query.filter(Manga.author.contains(author))

    if tags:
        tag_list = tags.split(",")
        query = query.filter(Manga.tags.any(Tag.name.in_(tag_list)))



    average_rating = func.avg(Rating.rating).label('average_rating')
    query = query.outerjoin(Rating).group_by(Manga.id).add_columns(average_rating)


    if sort_by:
        if sort_by == "created_at":
            if order == "desc":
                query = query.order_by(desc(Manga.created_at))
            else:
                query = query.order_by(Manga.created_at)

        elif sort_by == "rating":
            if order == "desc":
                query = query.order_by(desc(average_rating))
            else:
                query = query.order_by(average_rating)

        elif sort_by == "publication_year":
            if order == "desc":
                query = query.order_by(desc(Manga.publication_year))
            else:
                query = query.order_by(Manga.publication_year)


    mangas_page = query.paginate(page=page, per_page=per_page)
    mangas_list = []

    for manga,avg_rating in mangas_page.items:
        manga_json = manga.to_json()
        manga_json['averageRating'] = avg_rating if avg_rating else 0
        mangas_list.append(manga_json)

    print(mangas_list)

    return jsonify({
        "mangas": mangas_list,
        "total_pages": mangas_page.pages,
        "current_page": mangas_page.page,
        "per_page": mangas_page.per_page,
    })


@app.route("/mangas/<int:manga_id>",methods=["GET"])
@jwt_required()
def get_manga_by_id(manga_id):
    try:
        manga = Manga.query.get(manga_id)
        if manga:
            average_rating = db.session.query(func.avg(Rating.rating).filter(Rating.manga_id == manga_id)).scalar()
            manga_data = manga.to_json()
            manga_data['averageRating'] = average_rating if average_rating else 0
            token = request.headers.get("Authorization")
            if token:
                try:
                    decoded_token = get_jwt_identity()
                    user = User.query.filter_by(username=decoded_token).first()
                    if user:
                        user_rating = db.session.query(Rating.rating).filter(Rating.manga_id == manga_id,
                                                                        Rating.user_id == user.id).scalar()
                        manga_data['userRating'] = user_rating if user_rating else 0
                        is_favourite = db.session.query(Favourite.id).filter(Favourite.manga_id == manga_id,
                                                                             Favourite.user_id == user.id).first()
                        manga_data['isFavourite'] = bool(is_favourite)

                except Exception as e:
                    print(e)
                    pass

            return jsonify({"manga": manga_data}), 200
        return jsonify({"message": "Manga not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route("/mangas/random",methods=["GET"])
@jwt_required()
def get_random_manga():
    try:
        random_manga = Manga.query.filter(
        ~Manga.tags.any(Tag.name == "Hentai")
    ).order_by(func.random()).first()

        print(random_manga)

        if not random_manga:
            return jsonify({"error": "No mangas found"}), 404


        if random_manga:
            average_rating = db.session.query(func.avg(Rating.rating).filter(Rating.manga_id == random_manga.id)).scalar()
            manga_data = random_manga.to_json()
            manga_data['averageRating'] = average_rating if average_rating else 0
            token = request.headers.get("Authorization")
            if token:
                try:
                    decoded_token = get_jwt_identity()
                    user = User.query.filter_by(username=decoded_token).first()
                    if user:
                        user_rating = db.session.query(Rating.rating).filter(Rating.manga_id == random_manga.id,
                                                                        Rating.user_id == user.id).scalar()
                        manga_data['userRating'] = user_rating if user_rating else 0
                        is_favourite = db.session.query(Favourite.id).filter(Favourite.manga_id == random_manga.id,
                                                                             Favourite.user_id == user.id).first()
                        manga_data['isFavourite'] = bool(is_favourite)

                except Exception as e:
                    print(e)
                    pass

            return jsonify({"manga": manga_data}), 200
        return jsonify({"message": "Manga not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@app.route("/featured",methods=['GET'])
def get_featured():

    featured_mangas = Manga.query.filter(
        Manga.is_featured
    ).order_by(desc(Manga.created_at)).limit(10).all()

    featured_mangas_list = [manga.to_json() for manga in featured_mangas]

    print(featured_mangas_list)

    return jsonify({
        "mangas": featured_mangas_list
    })

@app.route("/tags",methods=["GET"])
def get_tags():
    all_tags = Tag.query.all()

    all_tags_list = [tag.to_json() for tag in all_tags]

    return jsonify({
        "tags": all_tags_list
    })


@app.route("/mangas/<int:manga_id>/favourite",methods=["POST"])
@jwt_required()
def toggle_favourite(manga_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        manga = Manga.query.get(manga_id)

        if not manga or not user:
            return jsonify({"message": "Manga or User not found"}), 404

        favourite = Favourite.query.filter_by(manga_id=manga.id,user_id=user.id).first()

        if favourite:
            db.session.delete(favourite)
            db.session.commit()
            return jsonify({"message": "Manga removed from favourites!"}),200

        new_favourite = Favourite(manga_id=manga.id,user_id=user.id)
        db.session.add(new_favourite)
        db.session.commit()

        return jsonify({"message": "Manga added to favourites!"}),200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/search-history",methods=["POST"])
@jwt_required()
def record_search():
    try:
        data = request.get_json()
        if not data or "mangaId" not in data:
            return jsonify({"error": "Please provide manga id!"}),401
        manga_id = data["mangaId"]

        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        if not user:
            return jsonify({"error": "User not found"}),400

        #only keep 1 manga in search history and delete old record when user search the manga again.
        existing_search = SearchHistory.query.filter_by(manga_id=manga_id, user_id=user.id).first()
        if existing_search:
            db.session.delete(existing_search)
            db.session.commit()

        new_search = SearchHistory(user_id=user.id, manga_id=manga_id)
        db.session.add(new_search)
        db.session.commit()

        return jsonify({"message": "Search history recorded!"}),200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Error during search history recording{str(e)}"}), 400








@app.route("/mangas/<int:manga_id>/rate",methods=["POST"])
@jwt_required()
def rate_manga(manga_id):
    try:
        data = request.get_json()
        if not data or 'rating' not in data:
            print("No rating provided")
            return jsonify({"error": "No rating provided"}), 400
        rating = data['rating']
        if not (isinstance(rating, int) and 1 <= rating <= 5):
            print("Rating must be an integer between 1 and 5")
            return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        manga = Manga.query.get(manga_id)

        if not manga or not user:
            return jsonify({"error": "Manga or User not found"}), 404

        existing_rating = Rating.query.filter_by(manga_id=manga.id, user_id=user.id).first()

        if existing_rating:
            existing_rating.rating = rating
            db.session.commit()
            return jsonify({"message": "Rating updated successfully"}),200

        new_rating = Rating(user_id=user.id,manga_id=manga_id, rating=rating)
        db.session.add(new_rating)
        db.session.commit()

        return jsonify({"message": "Rating submitted successfully"}),200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400




@app.route("/recommend_manga")
def recommend_manga():
    pass

def fetch_anilist_data(query,variables):
    """
    Sends a GraphQL query to AniList API and returns parsed JSON reponse.
    """
    url = 'https://graphql.anilist.co'
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    json_data = {
        'query': query,
        'variables': variables,
    }

    response = requests.post(url,json=json_data,headers=headers)
    response.raise_for_status()
    return response.json()

def save_manga_data(mangas):
    """Takes a list of manga information as input.
    Iterates through each manga,checks if a manga with that title already exists and if it does it skip it,
    otherwise it creates a new Manga object and populates it with the data from the API response.
    After that it adds the Manga object to the database sesssion and commits the changes to the database.

    Finally, it gets the different genres of the manga and adds a tag to the table, if there is no tag for the specific genre.
    After that It adds tags to the specific manga.

    """

    with app.app_context():
        for manga_data in mangas:
            existing_manga = Manga.query.filter_by(title=manga_data['title']['romaji']).first()
            if existing_manga:
                print(f"Manga {manga_data['title']['romaji']} already exists in db")
                continue

            author_name = "Unknown Author"
            if manga_data.get('studios') and manga_data['studios'].get('edges') and len(
                    manga_data['studios']['edges']) > 0:

                author_name = manga_data['studios']['edges'][0]['node'].get('name', 'Unknown Author')

            try:
                new_manga = Manga(title=manga_data['title']['romaji'],
                                  author=author_name,
                                  description=manga_data['description'] if manga_data['description'] else 'No description',
                                  image_url=manga_data['coverImage']['large'],
                                  publication_year=manga_data['startDate']['year'],
                                  publication_status=manga_data['status']

                                  )
                db.session.add(new_manga)
                db.session.commit()
            except Exception as e:
                print(f"Error during manga creating {str(e)}")

            for genre in manga_data['genres']:
                existing_tag = Tag.query.filter_by(name=genre).first()
                if not existing_tag:
                    try:
                        new_tag = Tag(name=genre)
                        db.session.add(new_tag)
                        db.session.commit()
                        existing_tag = new_tag
                    except Exception as e:
                        print(f"Error during tag creation {str(e)}")
                new_manga.tags.append(existing_tag)

            db.session.commit()

            print(f"Added {manga_data['title']['romaji']} to database")

def search_manga(search_term,page):
    """

    Defines query and variables for searching manga and then calls the fetch_anilist_data() function.
    """

    query = """
    query ($page: Int, $perPage: Int, $search: String) {
              Page(page: $page, perPage: $perPage) {
                media(search: $search, type: MANGA) {
                  id
                 title {
                      romaji
                    }
                  studios(sort: ID){
                   edges {
                    node {
                      name
                      }
                    }
                 }
                  description
                 coverImage {
                   large
                    }
                   startDate{
                     year
                   }
                 status
                 genres
                }
              }
            }
    """
    variables = {
        "search": search_term,
        "page": page,
        "perPage": 10,
    }
    return fetch_anilist_data(query, variables)



if __name__ == '__main__':
    # with app.app_context():
    #     db.create_all()



    # manga_search_results = search_manga('Kyou wa Kanojo ga Inai kara',1)
    # if manga_search_results and 'data' in manga_search_results and 'Page' in manga_search_results['data'] and 'media' in manga_search_results['data']['Page']:
    #     manga_data = manga_search_results['data']['Page']['media']
    #     save_manga_data(manga_data)


    app.run(debug=True)
