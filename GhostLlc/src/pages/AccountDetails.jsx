import { useParams } from "react-router-dom"
import availableAccounts from "../constants";
import categoryAccounts from "../constants/category";
import NavBar from "../components/NavBar";
import { AdminIcon } from "../utils";

const AccountDetails = () => {
    const { slug } = useParams();
    let account = availableAccounts.find((acc) => acc.slug === slug);

    if (!account) {
        for (const category of categoryAccounts) {
            const foundGame = category.games.find((game) => game.slug === slug);
            if (foundGame) {
                account = foundGame;
                break;
            }
        }
    }

    if (!account) {
        return <div className="text-center text-red-500">Account not found</div>;
    }

    return (
        <>
            <NavBar />
            <div className="p-5 bg-gray-900 min-h-screen text-white">
                <div className="flex flex-col md:flex-row justify-between gap-7 mt-5">
                    <div className="max-w-4xl">
                        {/* Account Header */}
                        <div className="flex flex-col items-start md:items-start gap-4">
                            <img src={account.img} alt={account.title} className="w-[500px] h-[300px] object-cover rounded-md" />
                            <div>
                                <h1 className="text-md md:text-xl font-bold">{account.title}</h1>
                                <span className="flex justify-between items-center mt-2">
                                    <p className="text-gray-400 mr-44">{account.views} Total Views</p>
                                    <img src={AdminIcon} alt="admin" className="w-8 md:w-10 hover:cursor-pointer" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="w-auto md:w-[50%] h-auto border p-4 rounded-lg">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-2">Details</h2>
                        <p className="text-gray-300">{account.details}</p>
                    </div>
                </div>

                {/* Screenshots */}
                {account.screenShots && account.screenShots.length > 0 && (
                    <div className="mt-6 border p-5 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">Screenshots</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {account.screenShots.map((shot) => (
                                <img key={shot.id} src={shot.img} alt="screenshot" className="w-full h-40 object-cover rounded-md" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default AccountDetails