import React,{useState,useEffect,useRef} from 'react';
import axios from 'axios';
import '../MangaList.css';
import {Link} from 'react-router-dom';

const MangaList = ({ url,mangasPerPage,title, searchTerm}) => {
    console.log("MangaList received URL:", url);


    const [mangas,setMangas] = useState([]);
    const [currentPage,setCurrentPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);
    const [loading,setLoading] = useState(true);
    const mangaListRef = useRef(null);


    useEffect(() => {
        fetchMangas();
    },[url,currentPage,searchTerm]);

    useEffect(() => {
        setCurrentPage(1)
    },[url]);

     const fetchMangas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}page=${currentPage}&per_page=${mangasPerPage}&search=${searchTerm}`);
            console.log()
            setMangas(response.data.mangas);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error("Error fetching mangas",error);
        } finally {
            setLoading(false);
        }
     };

     const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber, () => {
                if (mangaListRef.current) {
                    mangaListRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            });
        }
     };

     const renderPagination = () => {
        const pageButtons = [];
        for (let i = 1; i <= totalPages; i++) {
            pageButtons.push(
                <li key={i} className={`page-item ${i === currentPage ? `active` : ``}`}>
                    <button onClick={() => handlePageChange(i)} className="page-link">{i}</button>
                </li>
            );
        }
        return (
            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? `disabled` : ``}`}>
                        <button onClick={() => handlePageChange(currentPage - 1)} className="page-link" tabIndex="-1" aria-disabled="true">Previous</button>
                    </li>
                    {pageButtons}
                    <li className={`page-item ${currentPage === totalPages ? `disabled` : ``}`}>
                        <button onClick={() => handlePageChange(currentPage + 1)} className="page-link" tabIndex="-1" aria-disabled="true">Next</button>
                    </li>
                </ul>
            </nav>
        );
    };

    const truncateDescription = (description,maxLength) => {
        if (!description) {
            return "";
        } 
        if (description.length > maxLength) {
            return description.slice(0,maxLength) + "...";
        }
        return description;
    };


    const renderStars = (averageRating) => {
        const filledStar = "★";
        const emptyStar = "☆";

        const rating = averageRating ? Math.round(averageRating) : 0;
        let stars = [];

        
        for(let i = 0;i < 5; i++){
            if (i < rating) {
              stars.push(<span key = {i} className="star" dangerouslySetInnerHTML={{ __html: filledStar }} />);
           } else {
               stars.push(<span key = {i} className="star" dangerouslySetInnerHTML={{ __html: emptyStar }} />);
           }
          }
           return stars;
    }


    const recordSearch = async (mangaId) => {
        try {
             await axios.post(`http://127.0.0.1:5000/search-history`,{
                 mangaId:mangaId
           },
           {
               headers: {
                 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
           })
         } catch (error) {
              console.error("Error recording search history:", error);
         }
    }


    return (
        <div>
            {title && <h2 className="manga-list-title">{title}</h2>}
            {loading ? (
                <p>Loading mangas...</p>
            ) : (
                <div className="manga-list-container">
                    {mangas.map(manga => (
                        <div key={manga.id} className="manga-square">
                            <Link to={`/mangas/${manga.id}`} className="manga-square-title-link" onClick={() => recordSearch(manga.id)}>
                                <img src={manga.imageUrl} alt={manga.title} className="manga-square-image"/>
                                </Link>
                                <div className="manga-square-details">
                                <Link to={`/mangas/${manga.id}`} className="manga-square-title-link" onClick={() => recordSearch(manga.id)}>
                                    <h5 className="manga-square-title">{manga.title}</h5>
                                    </Link>
                                    <p className="manga-square-rating"> {renderStars(manga.averageRating)}</p>
                                    <div className="manga-square-tags">
                                        {manga.tags.map((tag,index) => (
                                            <span key={index} className="manga-square-tag">{tag}</span>
                                        ))}
                                    </div>
                                    
                                    <p className="manga-square-description">{truncateDescription(manga.description,500)}</p>
                                </div>   
                        </div>
                    ))}
                </div>
            )}
            {renderPagination()}
        </div>
    );
};

export default MangaList;