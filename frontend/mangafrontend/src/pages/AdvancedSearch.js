import React , { useState,useEffect} from 'react';

import axios from 'axios';
import "../AdvancedSearch.css";
import MangaList from '../components/MangaList';
import { useLocation } from 'react-router-dom';

const AdvancedSearch = () => {
    const [sortOption,setSortOption] = useState('title');
    const [selectedTags,setSelectedTags] = useState([]);
    const [contentRating,setContentRating] = useState("");
    const [publicationStatus,setPublicationStatus] = useState("");
    const [publicationYear,setPublicationYear] = useState("");
    const [author,setAuthor] = useState("");
    const [artist,setArtist] = useState("");
    const [allTags,setAllTags] = useState([]);
    const [searchUrl,setSearchUrl] = useState('http://127.0.0.1:5000/mangas?');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tagFromUrl = queryParams.get('tags');

    


    useEffect(() => {
        fetchTags();
    },[]);

    useEffect(() => {
    
        if (tagFromUrl) {
            let url = 'http://127.0.0.1:5000/mangas?';
            setSelectedTags([tagFromUrl]);
            url += `tags=${tagFromUrl}&`;
            setSearchUrl(url);
        }
    
            
    },[tagFromUrl])


    const fetchTags = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/tags`);
            setAllTags(response.data.tags);
        }
        catch (error) {
            console.error("Error fetching tags",error);
        }
    };

    const handleTagSelect = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag))
        } else {
            setSelectedTags([...selectedTags,tag]);
        }
    }

    const handleSearch = () => {
        let url = 'http://127.0.0.1:5000/mangas?';
        if (sortOption) url += `sort_by=${sortOption.split(',')[0]}&order=${sortOption.split(',')[1]}&`;
        if (selectedTags.length > 0) url += `tags=${selectedTags.join(',')}&`;
        if (contentRating) url += `content_rating=${contentRating}&`;
        if (publicationStatus) url += `publication_status=${publicationStatus}&`;
        if (publicationYear) url += `publication_year=${publicationYear}&`;
        if (author) url += `author=${author}&`;
        if (artist) url += `artist=${author}&`;
        setSearchUrl(url)
    }

   

    return (
        <div>
          <div className="advanced-search-container">
              <div className="advanced-search-form">
                  <h2 className="advanced-search-title">Advanced Search</h2>
                   <div className="advanced-search-dropdowns">
                      <div className="dropdown-container">
                       <label htmlFor="sortOption">Sort By:</label>
                          <select id="sortOption" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                              <option value="">None</option>
                              <option value="created_at,desc">Latest Upload</option>
                              <option value="created_at,asc">Oldest Upload</option>
                              <option value="rating,desc">Highest Rating</option>
                              <option value="rating,asc">Lowest Rating</option>
                              <option value="publication_year,asc">Year Ascending</option>
                               <option value="publication_year,desc">Year Descending</option>
                          </select>
                      </div>
                     <div className="dropdown-container">
                        <label htmlFor="contentRating">Content Rating:</label>
                       <select id="contentRating" value={contentRating} onChange={(e) => setContentRating(e.target.value)}>
                            <option value="">Any</option>
                           <option value="safe">Safe</option>
                           <option value="nsfw">NSFW</option>
                          </select>
                    </div>

                   <div className="dropdown-container">
                        <label htmlFor="publicationStatus">Publication Status:</label>
                         <select id="publicationStatus" value={publicationStatus} onChange={(e) => setPublicationStatus(e.target.value)}>
                              <option value="">Any</option>
                              <option value="RELEASING">Releasing</option>
                              <option value="FINISHED">Finished</option>
                          </select>
                     </div>
                   </div>
                
                      <div className="tag-selector">
                           <label>Tags:</label>
                           <div className="tag-list">
                               {allTags.map((tag) => (
                                <button
                                     key={tag.id}
                                     className={`tag-button ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                                       onClick={() => handleTagSelect(tag.name)}
                                  >
                                  {tag.name}
                              </button>
                           ))}
                       </div>
                  </div>

                  <div className="input-container-row"> 
               <div className="input-container">
                    <label htmlFor="publicationYear">Publication Year:</label>
                      <input type="number" id="publicationYear" value={publicationYear} placeholder='Any' onChange={(e) => setPublicationYear(e.target.value)} />
                 </div>
                
                  <div className="input-container">
                      <label htmlFor="author">Authors:</label>
                       <input type="text" id="author" value={author} placeholder='Any' onChange={(e) => setAuthor(e.target.value)} />
                  </div>


                  <div className="input-container">
                      <label htmlFor="author">Arists:</label>
                       <input type="text" id="artist" value={artist} placeholder='Any' onChange={(e) => setArtist(e.target.value)} />
                  </div>


                  </div>


                   <button type="button" className="search-button" onClick={handleSearch}>Search</button>

              </div>
              {console.log("MangaList URL:", searchUrl)};     
            <MangaList url={searchUrl} mangasPerPage={24} searchTerm="" title="Advanced Search: "/>
         </div>
       </div>
    )
}

export default AdvancedSearch;