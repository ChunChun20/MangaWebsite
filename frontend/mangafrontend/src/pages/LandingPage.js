import React, {useState,useEffect} from "react";
import axios from 'axios';
import '../LandingPage.css';
import SmallMangaList from "../components/smallMangaList";
import {Link} from "react-router-dom";


export default function LandingPage(){
    const mangasPerPage = 24;
    const [featuredMangas,setFeaturedMangas] = useState([]);
    const [featuredMangasIndex,setFeaturedtMangasIndex] = useState(0);
    
    
    

    useEffect(() => {
        fetchFeaturedMangas();   
    }, []);

    const fetchFeaturedMangas = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/featured`);
            setFeaturedMangas(response.data.mangas);
        }
        catch (e) {
            console.error("error fetching featured mangas",e);
        }
    }
   
    const handlePrevManga = () => {
        setFeaturedtMangasIndex(prevIndex => (prevIndex === 0 ? featuredMangas.length - 1 : prevIndex - 1));
    }

    const handleNextManga = () => {
        setFeaturedtMangasIndex(prevIndex => (prevIndex === featuredMangas.length - 1 ? 0 : prevIndex + 1));
    }


    const recordSearch = async (mangaId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("User not logged in, search not recorded");
            return
        }
        try {
             await axios.post(`http://127.0.0.1:5000/search-history`,{
                 mangaId:mangaId
           },
           {
               headers: {
                 'Authorization': `Bearer ${token}`
                }
           })
         } catch (error) {
              console.error("Error recording search history:", error);
         }
    }

    return (
        <div>
            {featuredMangas.length > 0 && (
                <div className="featured-manga-container" style={{ backgroundImage: `url(${featuredMangas[featuredMangasIndex]?.coverImageUrl})`,
                }}>
                    <div className="featured-manga-content">
                        <h2 className="featured-manga-header">
                            Featured Mangas
                        </h2>
                        <div className="featured-manga-details d-flex align-items-start">
                           
                            <img className="featured-manga-image" src={featuredMangas[featuredMangasIndex]?.imageUrl} alt={featuredMangas[featuredMangasIndex]?.title} />
                       
                        <div className="featured-manga-text">
                        <Link to={`/mangas/${featuredMangas[featuredMangasIndex]?.id}`} className="manga-square-title-link" onClick={() => recordSearch(featuredMangas[featuredMangasIndex]?.id)}>
                            <h1 className="featured-manga-title">{featuredMangas[featuredMangasIndex]?.title}</h1>
                            </Link>
                            <div className="featured-manga-tags">
                                {featuredMangas[featuredMangasIndex]?.tags?.map((tag,index) => (
                                    <Link
                                    key = {index}
                                    to = {`/advanced-search?tags=${tag}`}
                                    className="manga-tag-link"
                                    >
                                    <span key={index} className="featured-manga-tag">
                                        {tag}
                                    </span>
                                    </Link>
                               ))}
                            </div>
                            <p className="featured-manga-description">{featuredMangas[featuredMangasIndex]?.description ?
                            featuredMangas[featuredMangasIndex]?.description.slice(0,1000) + "...": "No Description"}</p>
                        </div>
                        </div>
                           <div className="featured-manga-nav d-flex justify-content-end align-items-center">
                            <p>No.{featuredMangasIndex + 1}</p>
                            <button onClick={handlePrevManga}>{"<"}</button>
                            <button onClick={handleNextManga}>{">"}</button>
                            </div>     
                    </div>
                </div>
            )}

            <div className="container mt-4">
                <SmallMangaList url="http://127.0.0.1:5000/mangas?sort_by=created_at&order=desc" mangasPerPage={mangasPerPage} recordSearch={recordSearch}  title="Recently added"/>
                <SmallMangaList url="http://127.0.0.1:5000/mangas?sort_by=rating&order=desc" mangasPerPage={12} recordSearch={recordSearch}   title="Popular updates"/>
                <SmallMangaList url="http://127.0.0.1:5000/mangas?is_featured=true" mangasPerPage={12} recordSearch={recordSearch} title="Featured"/>
            
            </div>
           
                <br></br>
            
        </div>
    );
}