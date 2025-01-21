import React, {useState,useEffect,useRef} from "react";
import axios from 'axios';
import "../smallMangaList.css";
import {Link} from 'react-router-dom'

const SmallMangaList = ({ url,mangasPerPage,title ,recordSearch}) => {
    const [mangas,setMangas] = useState([]);
    const [loading,setLoading] = useState(true);
    const [hoveredManga,setHoveredManga] = useState(null);
    const [mousePosition,setMousePosition] = useState({x:0,y:0});
    const mangaCardRef = useRef(null);

    useEffect(() => {
        fetchMangas();
    },[url,mangasPerPage]);



    const fetchMangas = async () => {
        setLoading(true);
        try {
           const response = await axios.get(`${url}&per_page=${mangasPerPage}`);
             setMangas(response.data.mangas);
         } catch (error) {
            console.error("Error fetching mangas", error);
        } finally {
            setLoading(false);
       }
    };

    const truncateTitle = (title, maxLength) => {
        if (!title) {
          return ""; 
            }
          if (title.length > maxLength) {
                return title.slice(0, maxLength) + "...";
            }
         return title;
        };

    
        const handleMouseEnter = (event, manga) => {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const hoverWindowWidth = 400;
            const hoverWindowHeight = 300;
            let hoverY = event.clientY + 10;
            let hoverX = event.clientX + 10;
    
            if (event.clientY + 10 + hoverWindowHeight > windowHeight) {
                hoverY = event.clientY - hoverWindowHeight - 10;
            }
    
            if (event.clientX + 10 + hoverWindowWidth > windowWidth) {
                hoverX = event.clientX - hoverWindowWidth - 10;
            }
            setMousePosition({
                x: hoverX, y: hoverY
            });
            setHoveredManga(manga);
        };
    
        const handleMouseLeave = () => {
            setHoveredManga(null);
        };


        

    return (<div className="mb2">
    {title && <h2 className="small-manga-list-title">{title}</h2>}
    {loading ? (
        <p>Loading mangas...</p>
    ) : (
        <div className="small-manga-list-container">
            {mangas.map(manga => (
                <div key={manga.id} className="small-manga-card" 
                onMouseEnter={(event) => handleMouseEnter(event, manga)}
                onMouseLeave={handleMouseLeave}
                ref={mangaCardRef}>
                    <div className="small-manga-image-container">
                    <Link to={`/mangas/${manga.id}`} className="manga-square-title-link" onClick={() => recordSearch(manga.id)}>
                          <img src={manga.imageUrl} alt={manga.title} className="small-manga-image" />
                          </Link>
                        <div className="small-manga-details">
                            <Link to={`/mangas/${manga.id}`} className="manga-square-title-link" onClick={() => recordSearch(manga.id)}>
                            <h5 className="small-manga-title">{truncateTitle(manga.title, 20)}</h5>
                            </Link>
                             <p className="small-manga-info">{manga.author}</p>
                             <p className="small-manga-info">Publication: {manga.publicationYear}</p>
                             <p className="star">Rating: <span>&#9733;</span>{manga.averageRating}</p>
                        </div>
                    </div>
                    {hoveredManga && hoveredManga.id === manga.id && (
                                <div
                                    className="manga-hover-window"
                                    style={{
                                        left: mousePosition.x + 10,
                                        top: mousePosition.y + 10,
                                    }}
                                >
                                    <h5 className="hover-title">{manga.title}</h5>
                                    <div className="hover-content">
                                        <img src={manga.imageUrl} alt={manga.title} className="hover-img" />
                                        <div className="hover-details">
                                            <p><b>Author:</b> {manga.author}</p>
                                            <p><b>Publication Year:</b> {manga.publicationYear}</p>
                                            <p><b>Rating:</b> {manga.ratings.length > 0 ? manga.ratings.reduce((sum, rating) => sum + rating.rating, 0) / manga.ratings.length : 'No Ratings'}</p>

                                            <p><b>Tags:</b> {manga.tags.join(", ")}</p>
                                        </div>
                                    </div>
                                    <p className="hover-description"><b>Summary:</b> {manga.description ? manga.description.slice(0, 150) + "..." : "No Description"}</p>
                                </div>
                            )}
                </div>
            ))}
        </div>
    )}
</div>
);

};

export default SmallMangaList;