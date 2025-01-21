import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MangaList from '../components/MangaList';
import "../Search.css"

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || "";
    


    return (
        
            <div className="search-container">
        <div style={{ position: 'relative'}}> 
            <div className="container mt-4">
            <MangaList url="http://127.0.0.1:5000/mangas?" mangasPerPage={24} sortBy="created_at" order="desc" searchTerm={searchTerm} title={`Search results for "${searchTerm}"`} />
            </div>
        </div>
        </div>
        
    )
}

export default SearchResults;