import React, {useState} from "react";

function SearchBar({onSearch}) {
    const [searchTerm,setSearchTerm] = useState("")

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        onSearch(searchTerm)
    }

    return (
        <form onSubmit={handleSearchSubmit} className="d-flex">
            <input
            type="text"
            placeholder="Search for a manga..."
            value={searchTerm}
            onChange={handleInputChange}
            className="form-control me-2"
            />
            

        </form>
    );
}

export default SearchBar;