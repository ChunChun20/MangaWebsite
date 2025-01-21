
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../MangaDetailsPage.css';
import { jwtDecode } from 'jwt-decode';

const RandomMangaDetailsPage = () => {
    const { mangaId } = useParams();
    const [manga, setManga] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [isFavourite, setIsFavourite] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            } catch (e) {
                console.error("Invalid Token");
            }
        }
        fetchMangaDetails();
    }, [mangaId]); // Only fetch manga on mount or when mangaId changes

    const fetchMangaDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:5000/mangas/${mangaId ? mangaId : 'random'}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setManga(response.data.manga);
            if (response.data.manga.userRating) {
                setRating(response.data.manga.userRating);
            }
             if(response.data.manga.isFavorite != null){
                 setIsFavourite(response.data.manga.isFavorite)
             }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching manga details: ", error);
            navigate("/");
            setLoading(false);
        }
    };


    const handleRatingChange = async (newRating) => {
        if (!user) {
            alert("You must log in to rate a manga");
            navigate("/login");
        }
        try {
            await axios.post(`http://127.0.0.1:5000/mangas/${manga.id}/rate`, {
                rating: newRating
            },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            setRating(newRating);
          
        }
        catch (e) {
            console.error("Error sending rating", e);
        }
    };

    const handleAddToFavourites = async () => {
        if (!user) {
            alert("You must be logged in to add mangas to your favourites");
             navigate("/login");
        }
        try {
           await axios.post(`http://127.0.0.1:5000/mangas/${manga.id}/favourite`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsFavourite(!isFavourite);
        }
        catch (e) {
            console.error("Could not add to favourites", e);
        }
    };

    if (loading) {
        return <p>Loading manga details...</p>;
    }

    if (!manga) {
        return <p>Manga not found.</p>;
    }

    return (
        <div className="manga-detail-container">
            {/* <div className="manga-detail-header" style={{ backgroundImage: `url(${manga.imageUrl})` }}>
            </div> */}
            <div className="manga-detail-content">

                <h2 className="manga-details-title">{manga.title}</h2>
                <img src={manga.imageUrl} alt={manga.title} className="manga-detail-image" />
                <div className="manga-detail-tags">
                    {manga.tags.map((tag, index) => (<span key={index} className="manga-detail-tag">{tag}</span>))}
                </div>
                <p className="manga-details-rating">
                    Rating: {manga.averageRating}★
                </p>
                <p className="manga-detail-description">{manga.description ? manga.description : "No Description"}</p>

                <div className="manga-detail-actions">
                    <div className="rating-container">
                        {[1, 2, 3, 4, 5].map((star, index) => (
                            <span key={index} className={`details-star ${index < rating ? "filled" : ""}`}
                                onClick={() => handleRatingChange(index + 1)}
                            >★</span>
                        ))}
                    </div>
                    <button className="add-favourites-button" onClick={handleAddToFavourites}>
                        {isFavourite ? "Remove from favourites" : "Add to favourites"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RandomMangaDetailsPage;