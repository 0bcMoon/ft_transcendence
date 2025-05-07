
interface MessageBoxProps {
    message: string,
    sender: boolean,

}

const MessageBox = ({message, sender} : MessageBoxProps) => {

    // if (sender) {
    //     return (
    //         <p
    //             className="border-4 border-black w-[70%] bg-blue-200"
    //         >
    //             {message}
    //         </p>
    //     )
    // }

    return (

        <div className={`flex flex-col  w-full border border-yellow-500 h-18 ${sender ? "justify-end" : "justify-start" }`}> 
                <p
                    className="border-4 w-[70%]"
                >
                    {message}
                </p>
        </div>
    )
}
export default function Chat() {

    return (
        <div className="flex flex-col items-center   h-screen bg-gray-200
                        p-[2%] row-span-3 border-4 border-black col-span-2">

            <div
                className="grid grid-flow-row grid-rows-10 grid-cols-1 border-4 border-blue-500 h-full w-full"
            >
                <MessageBox 
                    message={"this is a message"} 
                    sender={false}
                />

                <MessageBox 
                    message={"this is a message"} 
                    sender={true}
                />

            </div>

            <input
                className="border-4 border-blue-500 h-[50px] 
                                w-full rounded-lg 
                                mt-2
                                placeholder:text-center p-4"
                placeholder="input your message"
            >
            </input>
        </div>
    );
}
