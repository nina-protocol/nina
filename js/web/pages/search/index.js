import dynamic from "next/dynamic";

const Search = dynamic(() => import('../../components/Search'))

const SearchPage = () => {
    return (
        <Search />
    )
}

export default SearchPage;