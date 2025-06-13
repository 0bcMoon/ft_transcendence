import { useState } from "react";
import Friends from "./FriendsProfileCard";


enum SearchOptionEnum {
    FindNewFriends = "Find New Friends",
    Friends = "Friends",
    FriendsRequest = "Friends Request",
    PendingRequest = "Pending Request",
    Blocked = "Blocked"
}

interface SearchOptionsProps {
    name: string
    searchOption?: SearchOptionEnum
    setSearchOption: (option: SearchOptionEnum) => void

}

const SearchOptions = ({ name, searchOption, setSearchOption }: SearchOptionsProps) => {

    return (
        <div
            onClick={() => { setSearchOption(name as SearchOptionEnum) }}
            className={`font-semibold flex items-center justify-center text-center
                        ${(searchOption === name) ? 'bg-gray-200' : ''}
                        pl-6 pr-6 border border-gray-100 h-9 text-center 
                        mr-4 ml-4 rounded-2xl`}>
            {name}
        </div>
    )
}



const RenderView = ({ searchOption }: { searchOption: SearchOptionEnum }) => {

    switch (searchOption) {
        case SearchOptionEnum.Friends:
            return <Friends />
        case SearchOptionEnum.FindNewFriends:
            return <div>Find New Friends View</div>;
        case SearchOptionEnum.FriendsRequest:
            return <div>Friends Request View</div>;
        case SearchOptionEnum.PendingRequest:
            return <div>Pending Request View</div>;
        case SearchOptionEnum.Blocked:
            return <div>Blocked View</div>;
        default:
            return <div>Select an option</div>;
    }
}

const FriendsPage = () => {

    const [searchOption, setSearchOption] = useState<SearchOptionEnum>(SearchOptionEnum.Friends);

    const searchOptions = [
        { name: SearchOptionEnum.Friends },
        { name: SearchOptionEnum.FindNewFriends },
        { name: SearchOptionEnum.FriendsRequest },
        { name: SearchOptionEnum.PendingRequest },
        { name: SearchOptionEnum.Blocked },
    ]


    return (

        <div
            className="col-span-13 h-[97svh]
                        rounded-xl 
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <input
                name="message"
                className="shadow-gray-50 bg-gray-100 h-13 w-140
                    rounded-lg m-4
                    placeholder:text-center p-4"
                placeholder="Search For Anything"
            >
            </input>

            <div
                className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap bg-white p-4 space-x-4
                                           flex flex-row w-full ">
                {searchOptions.map((option, index) => (
                    <SearchOptions key={index} setSearchOption={setSearchOption} searchOption={searchOption} {...option} />
                ))}
            </div>

            <div
                className="p-4 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4"
            >
                <RenderView searchOption={searchOption} />
            </div>

        </div>
    )
}

export default FriendsPage;
