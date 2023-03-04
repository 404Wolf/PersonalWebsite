const Card = ( {title, children} ) => {
    return (
        <div className="h-full">
            <div className="mx-auto translate-y-[1rem] bg-gray-700 text-white text-lg py-1 px-2 rounded-full w-32">
                <h2 className="text-center text-2xl text-bold">
                    { title }
                </h2>
            </div>
            <div className="p-5 pt-8 bg-slate-300 rounded-2xl h-full">
                { children }
            </div>
        </div>
    );
}
 
export default Card;